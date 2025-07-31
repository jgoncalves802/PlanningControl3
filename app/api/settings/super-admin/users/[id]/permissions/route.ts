import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar permissões de um usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        contractResponsibilities: {
          select: {
            contract: {
              select: {
                id: true,
                name: true,
                code: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar todos os contratos disponíveis
    const availableContracts = await prisma.contract.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    // Mapear contratos com status de permissão
    const contractsWithPermission = availableContracts.map(contract => {
      const hasPermission = user.contractResponsibilities.some(
        resp => resp.contract.id === contract.id
      );

      return {
        ...contract,
        hasPermission,
        assignedAt: hasPermission ? user.contractResponsibilities.find(
          resp => resp.contract.id === contract.id
        )?.contract : null
      };
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      permissions: contractsWithPermission,
      stats: {
        totalContracts: availableContracts.length,
        assignedContracts: user.contractResponsibilities.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar permissões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar permissão de contrato
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: 'ID do contrato é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se permissão já existe
    const existingPermission = await prisma.contractResponsible.findUnique({
      where: {
        contractId_userId: {
          contractId,
          userId: id
        }
      }
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'Usuário já tem permissão para este contrato' },
        { status: 409 }
      );
    }

    // Criar permissão
    await prisma.contractResponsible.create({
      data: {
        contractId,
        userId: id
      }
    });

    console.log(`✅ Permissão adicionada: ${user.name} -> ${contract.name}`);

    return NextResponse.json({
      message: 'Permissão adicionada com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      contract: {
        id: contract.id,
        name: contract.name,
        code: contract.code
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erro ao adicionar permissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover permissão de contrato
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'ID do contrato é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se permissão existe
    const existingPermission = await prisma.contractResponsible.findUnique({
      where: {
        contractId_userId: {
          contractId,
          userId: id
        }
      }
    });

    if (!existingPermission) {
      return NextResponse.json(
        { error: 'Usuário não tem permissão para este contrato' },
        { status: 404 }
      );
    }

    // Remover permissão
    await prisma.contractResponsible.delete({
      where: {
        contractId_userId: {
          contractId,
          userId: id
        }
      }
    });

    console.log(`✅ Permissão removida: ${user.name} -> ${contract.name}`);

    return NextResponse.json({
      message: 'Permissão removida com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      contract: {
        id: contract.id,
        name: contract.name,
        code: contract.code
      }
    });

  } catch (error) {
    console.error('❌ Erro ao remover permissão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 