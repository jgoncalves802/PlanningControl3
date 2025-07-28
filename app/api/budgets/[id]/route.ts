import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/budgets/[id] - Buscar orçamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        formulas: true,
        attachments: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 5,
        },
        approvals: {
          orderBy: { level: 'asc' },
        },
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/budgets/[id] - Atualizar orçamento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      clientName,
      projectType,
      startDate,
      endDate,
      status,
    } = body;

    // Verificar se o orçamento existe
    const existingBudget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se houve mudanças reais
    const hasChanges = 
      existingBudget.name !== name ||
      existingBudget.description !== description ||
      existingBudget.clientName !== clientName ||
      existingBudget.projectType !== projectType ||
      existingBudget.status !== status ||
      existingBudget.startDate?.getTime() !== startDate?.getTime() ||
      existingBudget.endDate?.getTime() !== endDate?.getTime();

    // Criar nova versão se houver mudanças significativas
    const shouldCreateVersion = 
      existingBudget.status === 'APPROVED' && hasChanges;

    if (shouldCreateVersion) {
      // Criar nova versão
      await prisma.budgetVersion.create({
        data: {
          budgetId: params.id,
          version: existingBudget.version + 1,
          name: `Versão ${existingBudget.version + 1}`,
          description: 'Atualização automática',
          data: existingBudget,
          createdBy: user.id,
        },
      });
    }

    // Atualizar orçamento
    const updatedBudget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        name,
        description,
        clientName,
        projectType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        version: shouldCreateVersion ? existingBudget.version + 1 : existingBudget.version,
      },
      include: {
        sections: {
          include: {
            items: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        formulas: true,
        attachments: true,
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id] - Excluir orçamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o orçamento existe
    const existingBudget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se pode ser excluído (apenas rascunhos)
    if (existingBudget.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Apenas orçamentos em rascunho podem ser excluídos' },
        { status: 400 }
      );
    }

    // Excluir orçamento (cascade irá excluir seções, itens, etc.)
    await prisma.budget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Orçamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 