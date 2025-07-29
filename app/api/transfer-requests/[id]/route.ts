import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransferStatus } from '@prisma/client';
import { emitTransferRequestEvent } from '../events/route';

// GET /api/transfer-requests/[id] - Detalhe da transferência
export async function GET(request: NextRequest, { params }) {
  try {
    const { id } = params;
    const transferRequest = await prisma.transferRequest.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!transferRequest) {
      return NextResponse.json({ error: 'Transferência não encontrada' }, { status: 404 });
    }
    return NextResponse.json(transferRequest, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erro ao buscar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}

// PUT /api/transfer-requests/[id] - Atualizar transferência
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Buscar transferência atual
    const currentTransfer = await prisma.transferRequest.findUnique({
      where: { id }
    });

    if (!currentTransfer) {
      return NextResponse.json({ error: 'Transferência não encontrada' }, { status: 404 });
    }

    // Preparar dados de atualização
    const updateData: any = {};

    // Atualizar status
    if (data.status) {
      updateData.status = data.status;
    }

    // Atualizar responsáveis e timestamps baseado no status
    switch (data.status) {
      case 'APPROVED':
        if (data.approvedById) {
          updateData.approvedById = data.approvedById;
          updateData.approvedAt = new Date();
        }
        break;
      
      case 'IN_PROGRESS':
        if (data.responsibleById) {
          updateData.responsibleById = data.responsibleById;
          updateData.transferredAt = new Date();
        }
        break;
      
      case 'COMPLETED':
        if (data.finalizedById) {
          updateData.finalizedById = data.finalizedById;
          updateData.finalizedAt = new Date();
          updateData.completedAt = new Date();
        }
        break;
    }

    // Atualizar transferência
    const updatedTransfer = await prisma.transferRequest.update({
      where: { id },
      data: updateData,
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true, currentFunction: { select: { name: true } } } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        responsibleBy: { select: { id: true, name: true, email: true } },
        finalizedBy: { select: { id: true, name: true, email: true } },
        fromContract: { select: { id: true, name: true, code: true } },
        toContract: { select: { id: true, name: true, code: true } },
      }
    });

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error('Erro ao atualizar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}

// DELETE /api/transfer-requests/[id] - Deletar transferência
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const deletedTransfer = await prisma.transferRequest.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Transferência deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
} 