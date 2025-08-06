import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

// GET - Obter permissões do sistema de um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { userId } = params

    // Verificar se o usuário atual pode acessar estas permissões
    if (session.user.role !== 'SUPER_ADMIN' && 
        (session.user.role !== 'COMPANY_ADMIN' || session.user.id === userId)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Buscar permissões do sistema do usuário
    const systemPermissions = await prisma.userSystemPermission.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        permission: 'asc'
      }
    })

    return NextResponse.json(systemPermissions)

  } catch (error) {
    console.error('Erro ao obter permissões do sistema:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar permissões do sistema de um usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { userId } = params
    const { permissions } = await request.json()

    // Verificar se o usuário atual pode modificar estas permissões
    if (session.user.role !== 'SUPER_ADMIN' && 
        (session.user.role !== 'COMPANY_ADMIN' || session.user.id === userId)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Verificar se o usuário alvo existe e pode ser modificado
    const targetUser = await prisma.userRoleAssignment.findFirst({
      where: { userId: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // COMPANY_ADMIN não pode modificar SUPER_ADMIN
    if (session.user.role === 'COMPANY_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para modificar SUPER_ADMIN' }, { status: 403 })
    }

    // COMPANY_ADMIN só pode modificar usuários da sua empresa
    if (session.user.role === 'COMPANY_ADMIN' && targetUser.companyId !== session.user.companyId) {
      return NextResponse.json({ error: 'Sem permissão para modificar usuário de outra empresa' }, { status: 403 })
    }

    // Processar permissões
    const operations = []

    for (const permission of permissions) {
      if (permission.id) {
        // Atualizar permissão existente
        operations.push(
          prisma.userSystemPermission.update({
            where: { id: permission.id },
            data: {
              isGranted: permission.isGranted,
              updatedAt: new Date()
            }
          })
        )
      } else {
        // Criar nova permissão
        operations.push(
          prisma.userSystemPermission.create({
            data: {
              userId: userId,
              permission: permission.permission,
              isGranted: permission.isGranted
            }
          })
        )
      }
    }

    // Executar operações em transação
    await prisma.$transaction(operations)

    // Registrar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_SYSTEM_PERMISSIONS',
        entityType: 'USER_SYSTEM_PERMISSION',
        entityId: userId,
        details: `Permissões do sistema atualizadas para usuário ${userId}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({ 
      message: 'Permissões do sistema atualizadas com sucesso',
      updatedPermissions: permissions.length
    })

  } catch (error) {
    console.error('Erro ao atualizar permissões do sistema:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 