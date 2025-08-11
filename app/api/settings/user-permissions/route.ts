import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as permissões de usuários (apenas para SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas SUPER_ADMIN pode listar todas as permissões
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para acessar esta funcionalidade' }, { status: 403 })
    }

    // Buscar todos os role assignments ativos
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      userRoles: userRoles.map(role => ({
        id: role.id,
        userId: role.userId,
        role: role.role,
        permissions: role.permissions,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        user: role.user
      }))
    })

  } catch (error) {
    console.error('Erro ao listar permissões de usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo role assignment (apenas para SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas SUPER_ADMIN pode criar role assignments
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para acessar esta funcionalidade' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, permissions } = body

    // Validar dados obrigatórios
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId e role são obrigatórios' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se já existe um role assignment ativo para este usuário
    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        isActive: true
      }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Usuário já possui um role assignment ativo' }, { status: 409 })
    }

    // Criar novo role assignment
    const newUserRole = await prisma.userRoleAssignment.create({
      data: {
        userId: userId,
        role: role,
        permissions: permissions || null,
        isActive: true,
        createdBy: session.user.id
      }
    })

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER_ROLE',
        entityType: 'USER_ROLE',
        entityId: newUserRole.id,
        details: {
          userId: userId,
          role: role,
          permissions: permissions
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Role assignment criado com sucesso',
      userRole: newUserRole
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar role assignment:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 