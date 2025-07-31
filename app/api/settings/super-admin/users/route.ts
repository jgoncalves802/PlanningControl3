import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar usuários
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        contractResponsibilities: {
          select: {
            contract: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        _count: {
          select: {
            auditLogs: true,
            transferRequestsMade: true,
            transferRequestsApproved: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Contar total
    const total = await prisma.user.count({ where });

    // Estatísticas
    const stats = await prisma.user.aggregate({
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: stats._count.id
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, clerkId } = body;

    // Validações
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado no sistema' },
        { status: 409 }
      );
    }

    // Verificar se Clerk ID já existe (se fornecido)
    if (clerkId) {
      const existingClerkId = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (existingClerkId) {
        return NextResponse.json(
          { error: 'Clerk ID já cadastrado no sistema' },
          { status: 409 }
        );
      }
    }

    // Criar usuário
    const createData: any = {
      name,
      email
    };
    
    // Só adicionar clerkId se ele existir e não for vazio
    if (clerkId && clerkId.trim() !== '') {
      createData.clerkId = clerkId;
    }

    const newUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, clerkId } = body;

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

    // Verificar se Clerk ID já existe (se foi alterado e fornecido)
    if (clerkId && clerkId !== existingUser.clerkId) {
      const clerkIdExists = await prisma.user.findUnique({
        where: { clerkId }
      });

      if (clerkIdExists) {
        return NextResponse.json(
          { error: 'Clerk ID já cadastrado no sistema' },
          { status: 409 }
        );
      }
    }

    // Atualizar usuário
    const updateData: any = {};
    
    // Só adicionar campos que foram fornecidos
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (clerkId !== undefined) {
      if (clerkId && clerkId.trim() !== '') {
        updateData.clerkId = clerkId;
      } else {
        updateData.clerkId = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
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