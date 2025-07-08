import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NFCBadgeAssignSchema, NFCBadgeStatus } from '@/lib/types/nfc-badges';
import { z } from 'zod';

// POST /api/nfc-badges/[id]/assign - Atribuir crachá a funcionário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = NFCBadgeAssignSchema.parse(body);

    // TODO: Obter ID do usuário atual do contexto de autenticação
    const currentUserId = 'user-temp-id'; // Substituir por autenticação real

    // Verificar se o crachá existe e está disponível
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

    if (badge.status !== NFCBadgeStatus.AVAILABLE) {
      return NextResponse.json(
        { error: 'Crachá não está disponível para atribuição' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    if (!badge.isActive) {
      return NextResponse.json(
        { error: 'Crachá está inativo' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Verificar se o funcionário existe
    const employee = await prisma.employee.findUnique({
      where: { id: validatedData.employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Verificar se o funcionário já possui um crachá
    const existingBadge = await prisma.nFCBadge.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        status: NFCBadgeStatus.ASSIGNED,
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Funcionário já possui um crachá atribuído' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // Atribuir o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: {
        employeeId: validatedData.employeeId,
        status: NFCBadgeStatus.ASSIGNED,
        assignedAt: new Date(),
        assignedBy: currentUserId,
        notes: validatedData.notes,
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

    console.error('Erro ao atribuir crachá:', error);
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