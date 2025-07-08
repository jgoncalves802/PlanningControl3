import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssignNFCBadgeData } from '@/lib/types/nfc-badges';
import { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { employeeId, notes } = body as AssignNFCBadgeData;

    // Verificar se o crachá existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
      include: {
        employee: true,
      },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'NFC Badge not found' },
        { status: 404 }
      );
    }

    if (existingBadge.status === 'ASSIGNED') {
      return NextResponse.json(
        { error: 'Badge is already assigned' },
        { status: 400 }
      );
    }

    // Verificar se o funcionário existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Verificar se o funcionário já tem um crachá atribuído
    const existingAssignment = await prisma.nFCBadge.findFirst({
      where: {
        employeeId: employeeId,
        status: 'ASSIGNED',
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Employee already has an assigned badge' },
        { status: 400 }
      );
    }

    // Atualizar o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: {
        employeeId: employeeId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
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

    return NextResponse.json(updatedBadge);
  } catch (error) {
    console.error('Error assigning NFC badge:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 