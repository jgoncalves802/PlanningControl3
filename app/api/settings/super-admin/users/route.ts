import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from '@/lib/auth-server'
import { 
  validateUserRoleExists, 
  validateUserRoleLimit, 
  validateRolePermissions, 
  normalizeUserRoleData, 
  validateUserRoleIntegrity 
} from '@/lib/validations/user-role'
import { validateUserLimit, updateCompanyUserCount } from '@/lib/validations/license'

const prisma = new PrismaClient()

// Função para criar usuário no Supabase Auth
async function createSupabaseUser(email: string, password: string = '123456') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configurações do Supabase não encontradas')
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // Confirma o email automaticamente
  })

  if (error) {
    console.error('Erro ao criar usuário no Supabase Auth:', error.message)
    throw new Error(`Erro ao criar usuário no Supabase Auth: ${error.message}`)
  }

  return data.user
}

// Função para buscar usuário no Supabase Auth
async function findSupabaseUser(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configurações do Supabase não encontradas')
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()

  if (error) {
    throw new Error(`Erro ao listar usuários no Supabase Auth: ${error.message}`)
  }

  return data.users.find(user => user.email === email)
}

// GET - Listar usuários
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode listar usuários
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para listar usuários' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode criar usuários
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para criar usuários' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, role, permissions, companyId } = body

    // Validações básicas
    if (!email || !name || !role) {
      return NextResponse.json({ 
        error: 'Email, nome e role são obrigatórios' 
      }, { status: 400 })
    }

    // 🔐 VALIDAÇÃO CRÍTICA: Apenas SUPER_ADMIN pode criar outros SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      console.error(`🚨 Tentativa de criação de SUPER_ADMIN por usuário não autorizado: ${session.user.email} (${session.user.role})`)
      
      // Log de auditoria para tentativa não autorizada
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'SUPER_ADMIN_CREATION_ATTEMPT',
            entityId: 'N/A',
            details: {
              attemptedBy: session.user.email,
              attemptedByRole: session.user.role,
              targetEmail: email,
              targetRole: role,
              timestamp: new Date().toISOString(),
              blocked: true
            }
          }
        })
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
      
      return NextResponse.json({ 
        error: 'Apenas Super Administradores podem criar outros Super Administradores',
        code: 'SUPER_ADMIN_CREATION_DENIED'
      }, { status: 403 })
    }

    // Log de auditoria para criação autorizada de SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && session.user.role === 'SUPER_ADMIN') {
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'SUPER_ADMIN_CREATION_AUTHORIZED',
            entityId: 'N/A',
            details: {
              createdBy: session.user.email,
              createdByRole: session.user.role,
              targetEmail: email,
              targetRole: role,
              timestamp: new Date().toISOString(),
              authorized: true
            }
          }
        })
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
    }

    // 🔐 VALIDAÇÃO DE LICENÇAS: Verificar limite de usuários por empresa
    if (companyId && role !== 'SUPER_ADMIN') {
      try {
        const licenseCheck = await validateUserLimit(companyId)
        
        if (!licenseCheck.canCreate) {
          console.error(`🚨 Tentativa de criação de usuário além do limite: ${session.user.email} para empresa ${companyId}`)
          
          // Log de auditoria para tentativa de criação além do limite
          try {
            await prisma.auditLog.create({
              data: {
                userId: session.user.id,
                action: 'USER_CREATION_LIMIT_EXCEEDED',
                entityId: companyId,
                details: {
                  attemptedBy: session.user.email,
                  attemptedByRole: session.user.role,
                  targetEmail: email,
                  targetRole: role,
                  companyId,
                  currentUsers: licenseCheck.current,
                  maxUsers: licenseCheck.limit,
                  usagePercentage: licenseCheck.usagePercentage,
                  timestamp: new Date().toISOString(),
                  blocked: true
                }
              }
            })
          } catch (auditError) {
            console.error('Erro ao registrar log de auditoria:', auditError)
          }
          
          return NextResponse.json({
            error: 'Limite de usuários atingido',
            details: {
              current: licenseCheck.current,
              limit: licenseCheck.limit,
              usagePercentage: licenseCheck.usagePercentage,
              planName: licenseCheck.planName,
              message: licenseCheck.message
            },
            code: 'LICENSE_LIMIT_EXCEEDED'
          }, { status: 400 })
        }
      } catch (licenseError) {
        console.error('Erro ao validar limite de licenças:', licenseError)
        return NextResponse.json({
          error: 'Erro ao validar limite de licenças',
          details: licenseError instanceof Error ? licenseError.message : 'Erro desconhecido'
        }, { status: 500 })
      }
    }

    // Normalizar e validar dados
    const normalizedData = normalizeUserRoleData({
      email: email.trim(),
      name: name.trim(),
      role: role.trim().toUpperCase(),
      companyId: companyId?.trim() || null,
      permissions: permissions || null
    })

    const integrityCheck = validateUserRoleIntegrity(normalizedData)
    if (!integrityCheck.valid) {
      return NextResponse.json({ 
        error: 'Dados inválidos',
        details: integrityCheck.errors
      }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Email já está em uso' 
      }, { status: 409 })
    }

    // Verificar se o role é válido
    if (!validateRolePermissions(normalizedData.role, normalizedData.permissions)) {
      return NextResponse.json({ 
        error: `Role '${normalizedData.role}' deve ter permissões válidas` 
      }, { status: 400 })
    }

    // Criar usuário no Supabase Auth primeiro
    let supabaseUser
    try {
      supabaseUser = await createSupabaseUser(normalizedData.email)
      console.log('✅ Usuário criado no Supabase Auth:', supabaseUser.id)
    } catch (error) {
      console.error('❌ Erro ao criar usuário no Supabase Auth:', error)
      return NextResponse.json({ 
        error: 'Erro ao criar usuário no sistema de autenticação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 })
    }

    // Criar usuário no banco de dados usando o ID do Supabase Auth
    const newUser = await prisma.user.create({
      data: {
        id: supabaseUser.id, // Usar o ID do Supabase Auth diretamente
        email: normalizedData.email,
        name: normalizedData.name,
        isActive: true
      }
    })

    console.log('✅ Usuário criado no banco de dados:', newUser.id)

    // Criar role assignment
    const userRole = await prisma.userRoleAssignment.create({
      data: {
        userId: supabaseUser.id, // Usar o ID do Supabase Auth diretamente
        role: normalizedData.role,
        companyId: normalizedData.companyId,
        permissions: normalizedData.permissions,
        isActive: true
      }
    })

    console.log('✅ Role assignment criado:', userRole.id)

    // 🔄 ATUALIZAR CONTADOR DE USUÁRIOS DA EMPRESA
    if (normalizedData.companyId) {
      try {
        await updateCompanyUserCount(normalizedData.companyId)
        console.log('✅ Contador de usuários da empresa atualizado')
      } catch (updateError) {
        console.error('❌ Erro ao atualizar contador de usuários:', updateError)
        // Não falhar a criação do usuário por erro no contador
      }
    }

    // Registrar no audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER',
        entityType: 'USER',
        entityId: newUser.id,
        details: {
          email: normalizedData.email,
          name: normalizedData.name,
          role: normalizedData.role,
          companyId: normalizedData.companyId
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        ...newUser,
        userRoles: [userRole]
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email já cadastrado no sistema' },
          { status: 409 }
        );
      }
    }

    // Se o email foi alterado, tentar vincular ao Supabase Auth
    if (email && email !== existingUser.email) {
      try {
        console.log(`🔄 Tentando vincular usuário ${email} ao Supabase Auth...`);
        
        // Verificar se o usuário já existe no Supabase Auth
        const existingSupabaseUser = await findSupabaseUser(email);
        
        if (existingSupabaseUser) {
          console.log(`✅ Usuário ${email} já existe no Supabase Auth`);
        } else {
          // Criar usuário no Supabase Auth
          const userPassword = password || '123456';
          const supabaseUser = await createSupabaseUser(email, userPassword);
          console.log(`✅ Usuário ${email} criado no Supabase Auth com ID: ${supabaseUser.id}`);
        }
      } catch (supabaseError) {
        console.error(`⚠️ Erro ao vincular ao Supabase Auth: ${supabaseError}`);
      }
    }

    // Atualizar usuário
    const updateData: any = {};
    
    // Só adicionar campos que foram fornecidos
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`✅ Usuário ${updatedUser.email} atualizado com sucesso`);

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser,
      supabaseLinked: true
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar permissões de um usuário
export async function PATCH(
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

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se já existe um role assignment para este usuário com o mesmo role
    const existingRoleAssignment = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: userId,
        role: role || 'USER'
      }
    })

    if (existingRoleAssignment) {
      // Atualizar role assignment existente
      const updatedUserRole = await prisma.userRoleAssignment.update({
        where: {
          id: existingRoleAssignment.id
        },
        data: {
          permissions: permissions,
          role: role || existingRoleAssignment.role,
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
            oldPermissions: existingRoleAssignment.permissions,
            newPermissions: permissions,
            role: role || existingRoleAssignment.role
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })

      return NextResponse.json({
        message: 'Permissões atualizadas com sucesso',
        userRole: updatedUserRole
      })
    } else {
      // Criar novo role assignment
      const newUserRole = await prisma.userRoleAssignment.create({
        data: {
          userId: userId,
          role: role || 'USER',
          permissions: permissions,
          isActive: true
        }
      })

      // Registrar no audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_USER_ROLE',
          entityType: 'USER_ROLE',
          entityId: userId,
          details: {
            newPermissions: permissions,
            role: role || 'USER'
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        }
      })

      return NextResponse.json({
        message: 'Role assignment criado com sucesso',
        userRole: newUserRole
      })
    }

  } catch (error) {
    console.error('Erro ao atualizar permissões do usuário:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// DELETE - Deletar usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        contractResponsibilities: true,
        transferRequestsMade: true,
        transferRequestsApproved: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário tem dependências
    const hasDependencies = 
      existingUser.contractResponsibilities.length > 0 ||
      existingUser.transferRequestsMade.length > 0 ||
      existingUser.transferRequestsApproved.length > 0;

    if (hasDependencies) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar usuário com dependências',
          details: {
            contractResponsibilities: existingUser.contractResponsibilities.length,
            transferRequestsMade: existingUser.transferRequestsMade.length,
            transferRequestsApproved: existingUser.transferRequestsApproved.length
          }
        },
        { status: 409 }
      );
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
