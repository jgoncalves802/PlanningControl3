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

// PUT /api/transfer-requests/[id] - Atualizar status, aprovar, rejeitar, concluir
export async function PUT(request: NextRequest, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const allowedFields = ['status', 'approvedById', 'completedAt'];
    const updates: any = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) updates[field] = data[field];
    });
    // Validação de status
    if (updates.status && !Object.values(TransferStatus).includes(updates.status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }
    if (updates.completedAt && isNaN(Date.parse(updates.completedAt))) {
      return NextResponse.json({ error: 'Data de conclusão inválida' }, { status: 400 });
    }
    if (updates.completedAt) updates.completedAt = new Date(updates.completedAt);
    const transferRequest = await prisma.transferRequest.update({
      where: { id },
      data: updates,
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });
    emitTransferRequestEvent('updated', transferRequest);
    return NextResponse.json(transferRequest);
  } catch (error) {
    console.error('Erro ao atualizar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}

// DELETE /api/transfer-requests/[id] - Soft delete (opcional: marcar como rejeitada)
export async function DELETE(request: NextRequest, { params }) {
  try {
    const { id } = params;
    // Soft delete: marcar como REJECTED
    const transferRequest = await prisma.transferRequest.update({
      where: { id },
      data: { status: TransferStatus.REJECTED },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });
    emitTransferRequestEvent('deleted', transferRequest);
    return NextResponse.json({ message: 'Transferência rejeitada', transferRequest });
  } catch (error) {
    console.error('Erro ao rejeitar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
} 