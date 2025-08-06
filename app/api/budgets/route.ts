import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Usuário mock temporário para desenvolvimento
const mockUser = {
  id: '1',
  name: 'Admin Geral',
  email: 'admin@demo-company.com',
  role: 'TENANT_ADMIN' as const,
  isActive: true,
};

// GET /api/budgets - Listar orçamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Só adicionar filtro de status se não for "all"
    if (status && status !== 'all') {
      where.status = status;
    }

    // Buscar orçamentos
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        include: {
          sections: {
            include: {
              items: true,
            },
          },
          formulas: true,
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.budget.count({ where }),
    ]);

    return NextResponse.json({
      budgets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar orçamentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Criar novo orçamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      clientName,
      projectType,
      startDate,
      endDate,
      sections = [],
    } = body;

    // Validações básicas
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o código já existe
    const existingBudget = await prisma.budget.findUnique({
      where: { code },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Código de orçamento já existe' },
        { status: 400 }
      );
    }

    // Criar orçamento
    const budget = await prisma.budget.create({
      data: {
        name,
        code,
        description,
        clientName,
        projectType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: mockUser.id,
        sections: {
          create: sections.map((section: any, index: number) => ({
            name: section.name,
            type: section.type,
            order: index + 1,
            items: {
              create: section.items?.map((item: any, itemIndex: number) => ({
                code: item.code,
                description: item.description,
                unit: item.unit,
                quantity: item.quantity || 0,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                formula: item.formula,
                parameters: item.parameters,
                order: itemIndex + 1,
              })) || [],
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            items: true,
          },
        },
        formulas: true,
        attachments: true,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
