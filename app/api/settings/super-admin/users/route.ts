import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings/super-admin/users - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
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
      role: 'USER', // Por enquanto, todos são USER
      companyId: null,
      companyName: null,
      isActive: true, // Por enquanto, todos ativos
      createdAt: user.createdAt,
      lastLogin: user.auditLogs[0]?.createdAt || null
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
  } catch (error) {
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

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Gerar um clerkId temporário (em produção, isso viria do Clerk)
    const tempClerkId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Criar usuário
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

    // Formatar resposta
    const formattedUser = {
      id: newUser.id,
      name: newUser.name || 'Nome não informado',
      email: newUser.email,
      role: 'USER',
      companyId: null,
      companyName: null,
      isActive: true,
      createdAt: newUser.createdAt,
      lastLogin: null
    };

    return NextResponse.json(formattedUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 