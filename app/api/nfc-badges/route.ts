import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NFCBadgeCreateSchema, NFCBadgeStatus, type NFCBadgeFilters } from '@/lib/types/nfc-badges';
import { z } from 'zod';

// GET /api/nfc-badges - Listar crachás com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as NFCBadgeStatus | null;
    const isActive = searchParams.get('isActive') === 'true' ? true : 
                    searchParams.get('isActive') === 'false' ? false : undefined;
    const employeeId = searchParams.get('employeeId') || '';
    const assignedBy = searchParams.get('assignedBy') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { badgeId: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { employee: { cpf: { contains: search, mode: 'insensitive' } } },
        { employee: { registration: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (assignedBy) {
      where.assignedBy = assignedBy;
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
            },
          },
          assignedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          revokedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { createdAt: 'desc' },
          { badgeId: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.nFCBadge.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      badges,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar crachás:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// POST /api/nfc-badges - Criar novo crachá
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = NFCBadgeCreateSchema.parse(body);

    // Verificar se o badgeId já existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { badgeId: validatedData.badgeId },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Já existe um crachá com este ID' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Criar o crachá
    const badge = await prisma.nFCBadge.create({
      data: {
        badgeId: validatedData.badgeId,
        notes: validatedData.notes,
        status: NFCBadgeStatus.AVAILABLE,
        isActive: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            cpf: true,
            registration: true,
            company: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        revokedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(badge, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    console.error('Erro ao criar crachá:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
} 