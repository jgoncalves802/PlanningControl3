import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';

// Função para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// GET /api/settings/super-admin/users - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const companyId = searchParams.get('companyId');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role && role !== 'all') {
      // Por enquanto, todos são USER, mas podemos expandir isso
      // where.role = role;
    }

    if (status && status !== 'all') {
      // Por enquanto, todos são ativos, mas podemos expandir isso
      // where.isActive = status === 'active';
    }

    if (companyId && companyId !== 'all') {
      // where.companyId = companyId;
    }

    // Buscar usuários
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          clerkId: true,
          createdAt: true,
          updatedAt: true,
          auditLogs: {
            select: {
              id: true,
              action: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      })
    ]);

    // Formatar dados para resposta
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Nome não informado',
      email: user.email,
      role: 'USER' as const, // Por enquanto, todos são USER
      companyId: null,
      companyName: null,
      isActive: true, // Por enquanto, todos ativos
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.auditLogs[0]?.createdAt.toISOString() || null,
      authId: user.clerkId && isValidUUID(user.clerkId) ? user.clerkId : null
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/settings/super-admin/users - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'email', 'password'];
    const errors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors[field] = 'Campo obrigatório';
      }
    });

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.email = 'Email inválido';
    }

    // Validação de senha
    if (data.password && data.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se o email já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Verificar se o email já existe no Supabase Auth
    let existingAuthUser: any = null;
    try {
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error('Erro ao verificar usuários no Supabase Auth:', authError);
        // Continuar mesmo com erro, apenas logar
      } else {
        existingAuthUser = authUsers.users.find((user: any) => user.email === data.email);
      }
    } catch (error) {
      console.error('Erro ao listar usuários do Supabase Auth:', error);
      // Continuar mesmo com erro
    }

    if (existingAuthUser && existingAuthUser.email) {
      return NextResponse.json(
        { error: 'Email já está em uso no sistema de autenticação' },
        { status: 409 }
      );
    }

    // 1. Criar usuário no Supabase Auth
    let authData = null;
    let authError = null;

    try {
      const { data: authResult, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: {
          name: data.name,
          role: data.role || 'USER',
          companyId: data.companyId || null
        }
      });

      if (createAuthError) {
        console.error('Erro ao criar usuário no Supabase Auth:', createAuthError);
        authError = createAuthError;
      } else if (authResult.user) {
        authData = authResult;
      }
    } catch (error) {
      console.error('Erro ao tentar criar usuário no Supabase Auth:', error);
      authError = error;
    }

    // Se falhou no Supabase Auth, criar apenas no banco com ID temporário
    if (authError || !authData) {
      console.log('Criando usuário apenas no banco de dados (falha no Supabase Auth)');
      
      const tempClerkId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          clerkId: tempClerkId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          clerkId: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Criar log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_CREATED_DB_ONLY',
          entityId: newUser.id,
          details: {
            createdBy: 'super_admin',
            userEmail: data.email,
            userRole: data.role || 'USER',
            authError: authError?.message || 'Erro desconhecido'
          }
        }
      });

      // Formatar resposta
      const formattedUser = {
        id: newUser.id,
        name: newUser.name || 'Nome não informado',
        email: newUser.email,
        role: data.role || 'USER',
        companyId: data.companyId || null,
        companyName: null,
        isActive: true,
        createdAt: newUser.createdAt.toISOString(),
        lastLogin: null,
        authId: null,
        warning: 'Usuário criado apenas no banco de dados. Falha na criação no Supabase Auth.'
      };

      return NextResponse.json(formattedUser, { status: 201 });
    }

    // 2. Criar usuário no banco de dados com ID do Supabase Auth
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        clerkId: authData.user.id, // Usar o ID do Supabase Auth
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 3. Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: 'USER_CREATED',
        entityId: newUser.id,
        details: {
          createdBy: 'super_admin',
          userEmail: data.email,
          userRole: data.role || 'USER',
          authId: authData.user.id
        }
      }
    });

    // Formatar resposta
    const formattedUser = {
      id: newUser.id,
      name: newUser.name || 'Nome não informado',
      email: newUser.email,
      role: data.role || 'USER',
      companyId: data.companyId || null,
      companyName: null,
      isActive: true,
      createdAt: newUser.createdAt.toISOString(),
      lastLogin: null,
      authId: authData.user.id
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 