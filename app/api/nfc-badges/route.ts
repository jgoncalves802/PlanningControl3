import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateNFCBadgeData } from '@/lib/types/nfc-badges';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Temporariamente removendo autenticação para testar
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { badgeId, notes } = body as CreateNFCBadgeData;

    // Validação dos dados
    if (!badgeId || typeof badgeId !== 'string') {
      return NextResponse.json(
        { error: 'Badge ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Verificar se o badgeId já existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { badgeId: badgeId.toUpperCase() },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Badge ID already exists' },
        { status: 400 }
      );
    }

    // Criar o crachá
    const newBadge = await prisma.nFCBadge.create({
      data: {
        badgeId: badgeId.toUpperCase(),
        status: 'AVAILABLE',
        notes: notes || undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            cpf: true,
            registration: true,
            company: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(newBadge, { status: 201 });
  } catch (error) {
    console.error('Error creating NFC badge:', error);
    
    // Verificar se é erro de chave estrangeira
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Invalid reference in badge creation' },
          { status: 400 }
        );
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Badge ID already exists' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Temporariamente removendo autenticação para testar
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { badgeId: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        {
          employee: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { cpf: { contains: search, mode: 'insensitive' } },
              { registration: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Buscar crachás
    const [badges, total] = await Promise.all([
      prisma.nFCBadge.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              cpf: true,
              registration: true,
              company: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.nFCBadge.count({ where }),
    ]);

    return NextResponse.json({
      badges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching NFC badges:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 