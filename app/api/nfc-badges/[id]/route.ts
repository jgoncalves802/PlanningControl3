import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateNFCBadgeData } from '@/lib/types/nfc-badges';
import { Prisma } from '@prisma/client';

export async function GET(
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
            avatar: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'NFC Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error fetching NFC badge:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { badgeId, notes, status } = body as UpdateNFCBadgeData;

    // Verificar se o crachá existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'NFC Badge not found' },
        { status: 404 }
      );
    }

    // Verificar se o badgeId já existe (se estiver sendo alterado)
    if (badgeId && badgeId !== existingBadge.badgeId) {
      const duplicateBadge = await prisma.nFCBadge.findUnique({
        where: { badgeId: badgeId.toUpperCase() },
      });

      if (duplicateBadge) {
        return NextResponse.json(
          { error: 'Badge ID already exists' },
          { status: 400 }
        );
      }
    }

    // Atualizar o crachá
    const updatedBadge = await prisma.nFCBadge.update({
      where: { id: params.id },
      data: {
        badgeId: badgeId ? badgeId.toUpperCase() : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status || undefined,
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
    console.error('Error updating NFC badge:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export async function DELETE(
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

    // Verificar se o crachá existe
    const existingBadge = await prisma.nFCBadge.findUnique({
      where: { id: params.id },
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'NFC Badge not found' },
        { status: 404 }
      );
    }

    // Verificar se o crachá está atribuído
    if (existingBadge.status === 'ASSIGNED') {
      return NextResponse.json(
        { error: 'Cannot delete assigned badge. Revoke assignment first.' },
        { status: 400 }
      );
    }

    // Deletar o crachá
    await prisma.nFCBadge.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'NFC Badge deleted successfully' });
  } catch (error) {
    console.error('Error deleting NFC badge:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 