import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateNFCBadgeData } from '@/lib/types/nfc-badges';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const assignedEmployee = searchParams.get('assignedEmployee') || 'all';

    console.log('GET /api/nfc-badges - Filters:', { search, status, assignedEmployee });

    // Construir filtros WHERE dinamicamente
    const whereClause: Prisma.NFCBadgeWhereInput = {};

    // Filtro de busca por ID do crachá
    if (search) {
      whereClause.badgeId = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Filtro de status - não incluir se for vazio ou 'all'
    if (status && status !== 'all') {
      whereClause.status = status as any;
    }

    // Filtro de funcionário atribuído
    if (assignedEmployee !== 'all') {
      if (assignedEmployee === 'assigned') {
        whereClause.employeeId = { not: null };
      } else if (assignedEmployee === 'unassigned') {
        whereClause.employeeId = null;
      } else {
        whereClause.employeeId = assignedEmployee;
      }
    }

    console.log('WHERE clause:', JSON.stringify(whereClause, null, 2));

    const [badges, totalCount, availableCount, assignedCount] = await Promise.all([
      prisma.nFCBadge.findMany({
        where: whereClause,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Total count com filtros aplicados
      prisma.nFCBadge.count({
        where: whereClause
      }),
      // Count de disponíveis
      prisma.nFCBadge.count({
        where: {
          status: 'AVAILABLE'
        }
      }),
      // Count de atribuídos
      prisma.nFCBadge.count({
        where: {
          status: 'ASSIGNED'
        }
      })
    ]);

    console.log('Found badges:', badges.length);
    console.log('Badge stats - Total:', totalCount, 'Available:', availableCount, 'Assigned:', assignedCount);

    // Transformar os dados para o formato esperado pelo frontend
    const transformedBadges = badges.map(badge => ({
      ...badge,
      assignedEmployee: badge.employee,
      isActive: true // Adicionar campo isActive que estava faltando
    }));

    return NextResponse.json({
      badges: transformedBadges,
      pagination: {
        total: totalCount,
        available: availableCount,
        assigned: assignedCount
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error fetching badges:', error);
    
    // Fallback para dados offline/cached
    return NextResponse.json({
      badges: [],
      pagination: {
        total: 0,
        available: 0,
        assigned: 0
      }
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { badgeId, notes } = body as CreateNFCBadgeData;

    console.log('Creating badge with data:', { badgeId, notes });

    // Validação dos dados
    if (!badgeId || typeof badgeId !== 'string') {
      console.log('Validation failed: badgeId is required');
      return NextResponse.json(
        { error: 'ID do crachá é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o crachá já existe
    console.log('Checking if badge exists:', badgeId);
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { badgeId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (existingBadge) {
      console.log('Badge already exists:', existingBadge.id);
      
      // Retornar o crachá existente em vez de erro, para permitir atribuição
      const transformedBadge = {
        ...existingBadge,
        assignedEmployee: existingBadge.employee
      };
      
      return NextResponse.json(transformedBadge, {
        status: 200, // 200 em vez de 400 para indicar sucesso
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Criar o crachá
    console.log('Creating new badge...');
    const badge = await prisma.nFCBadge.create({
      data: {
        badgeId,
        notes: notes || null,
        status: 'AVAILABLE',
        isActive: true
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    console.log('Badge created successfully:', badge.id);

    // Transformar os dados para o formato esperado pelo frontend
    const transformedBadge = {
      ...badge,
      assignedEmployee: badge.employee
    };

    return NextResponse.json(transformedBadge, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error creating badge:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log('Prisma error code:', error.code);
      console.log('Prisma error message:', error.message);
      
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Crachá com este ID já existe' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message
      },
      { status: 500 }
    );
  }
} 