import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { UserPermissions, getDefaultPermissions, mergePermissions } from '@/lib/types/permissions'

// GET - Obter permissões de um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode gerenciar permissões
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 })
    }

    const { userId } = params

    // Buscar role assignment do usuário
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (!userRole) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Obter permissões padrão baseadas no role
    const defaultPermissions = getDefaultPermissions(userRole.role as any)
    
    // Mesclar com permissões personalizadas se existirem
    const customPermissions = userRole.permissions as UserPermissions | null
    const finalPermissions = customPermissions 
      ? mergePermissions(defaultPermissions, customPermissions)
      : defaultPermissions

    return NextResponse.json({
      userId,
      role: userRole.role,
      permissions: finalPermissions,
      customPermissions: customPermissions
    })

  } catch (error) {
    console.error('Erro ao obter permissões do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar permissões de um usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode gerenciar permissões
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 })
    }

    const { userId } = params
    const body = await request.json()
    const { permissions, role } = body

    // Validar dados
    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Permissões inválidas' }, { status: 400 })
    }

    // Buscar role assignment existente
    let userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (!userRole) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Atualizar permissões
    const updatedUserRole = await prisma.userRoleAssignment.update({
      where: {
        id: userRole.id
      },
      data: {
        permissions: permissions,
        role: role || userRole.role,
        updatedAt: new Date()
      }
    })

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_USER_PERMISSIONS',
        entityType: 'USER_ROLE',
        entityId: userId,
        details: {
          oldPermissions: userRole.permissions,
          newPermissions: permissions,
          role: role || userRole.role
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Permissões atualizadas com sucesso',
      userRole: updatedUserRole
    })

  } catch (error) {
    console.error('Erro ao atualizar permissões do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover permissões personalizadas (voltar para padrão)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode gerenciar permissões
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 })
    }

    const { userId } = params

    // Buscar role assignment existente
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (!userRole) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Remover permissões personalizadas (definir como null)
    const updatedUserRole = await prisma.userRoleAssignment.update({
      where: {
        id: userRole.id
      },
      data: {
        permissions: null,
        updatedAt: new Date()
      }
    })

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'RESET_USER_PERMISSIONS',
        entityType: 'USER_ROLE',
        entityId: userId,
        details: {
          oldPermissions: userRole.permissions,
          newPermissions: null
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Permissões personalizadas removidas com sucesso',
      userRole: updatedUserRole
    })

  } catch (error) {
    console.error('Erro ao remover permissões personalizadas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 