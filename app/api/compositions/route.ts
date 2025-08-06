import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// GET /api/compositions - Listar composições
export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Buscar composições
    const [compositions, total] = await Promise.all([
      prisma.composition.findMany({
        where,
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.composition.count({ where }),
    ]);

    return NextResponse.json({
      compositions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar composições:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/compositions - Criar nova composição
export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      description,
      unit,
      category,
      items = [],
    } = body;

    // Validações básicas
    if (!name || !code || !unit) {
      return NextResponse.json(
        { error: 'Nome, código e unidade são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o código já existe
    const existingComposition = await prisma.composition.findUnique({
      where: { code },
    });

    if (existingComposition) {
      return NextResponse.json(
        { error: 'Código de composição já existe' },
        { status: 400 }
      );
    }

    // Criar composição
    const composition = await prisma.composition.create({
      data: {
        name,
        code,
        description,
        unit,
        category,
        items: {
          create: items.map((item: any, index: number) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity || 0,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            order: index + 1,
          })),
        },
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(composition, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar composição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
