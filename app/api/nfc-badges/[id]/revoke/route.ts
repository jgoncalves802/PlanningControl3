import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RevokeNFCBadgeData } from '@/lib/types/nfc-badges';

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
    const { notes } = body as RevokeNFCBadgeData;

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

    if (existingBadge.status !== 'ASSIGNED') {
      return NextResponse.json(
        { error: 'Badge is not assigned' },
        { status: 400 }
      );
    }

    // Revogar o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: {
        employeeId: null,
        status: 'AVAILABLE',
        assignedAt: null,
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
    console.error('Error revoking NFC badge:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 