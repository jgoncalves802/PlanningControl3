import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NFCBadgeRevokeSchema, NFCBadgeStatus } from '@/lib/types/nfc-badges';
import { z } from 'zod';

// POST /api/nfc-badges/[id]/revoke - Revogar crachá de funcionário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = NFCBadgeRevokeSchema.parse(body);

    // TODO: Obter ID do usuário atual do contexto de autenticação
    const currentUserId = 'user-temp-id'; // Substituir por autenticação real

    // Verificar se o crachá existe e está atribuído
    const badge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
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

    if (badge.status !== NFCBadgeStatus.ASSIGNED) {
      return NextResponse.json(
        { error: 'Crachá não está atribuído a nenhum funcionário' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Revogar o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: {
        employeeId: null,
        status: NFCBadgeStatus.REVOKED,
        revokedAt: new Date(),
        revokedBy: currentUserId,
        notes: validatedData.notes || validatedData.reason,
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

    console.error('Erro ao revogar crachá:', error);
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