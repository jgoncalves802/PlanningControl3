import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NFCBadgeUpdateSchema, NFCBadgeStatus } from '@/lib/types/nfc-badges';
import { z } from 'zod';

// GET /api/nfc-badges/[id] - Buscar crachá específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const badge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
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

    if (!badge) {
      return NextResponse.json(
        { error: 'Crachá não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    return NextResponse.json(badge, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar crachá:', error);
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

// PUT /api/nfc-badges/[id] - Atualizar crachá
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = NFCBadgeUpdateSchema.parse(body);

    // Verificar se o crachá existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Crachá não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Se está mudando o badgeId, verificar se não existe outro com o mesmo ID
    if (validatedData.badgeId && validatedData.badgeId !== existingBadge.badgeId) {
      const duplicateBadge = await prisma.nFCBadge.findUnique({
        where: { badgeId: validatedData.badgeId },
      });

      if (duplicateBadge) {
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
    }

    // Atualizar o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json(updatedBadge, {
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

    console.error('Erro ao atualizar crachá:', error);
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

// DELETE /api/nfc-badges/[id] - Deletar crachá
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o crachá existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Crachá não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Verificar se o crachá está atribuído a algum funcionário
    if (existingBadge.employeeId) {
      return NextResponse.json(
        { error: 'Não é possível deletar um crachá que está atribuído a um funcionário. Revogue primeiro.' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Deletar o crachá
    await prisma.nFCBadge.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Crachá deletado com sucesso' },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error) {
    console.error('Erro ao deletar crachá:', error);
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