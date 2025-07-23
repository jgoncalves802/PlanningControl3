import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/employees/[id]/assignment - Atualizar alocação de funcionário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { contractId, contractAssignmentDate } = body;

    // Validar se o funcionário existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: {
        currentContract: true,
        currentFunction: true
      }
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Se contractId for null, desvincular do contrato atual
    if (contractId === null) {
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          contractId: null,
          currentContractId: null,
          currentFunctionId: null,
          contractAssignmentDate: null
        },
        include: {
          currentContract: true,
          currentFunction: true
        }
      });

      return NextResponse.json({
        message: 'Funcionário desvinculado do contrato com sucesso',
        employee: updatedEmployee
      });
    }

    // Validar se o contrato existe e está ativo
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        isActive: true
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado ou inativo' },
        { status: 400 }
      );
    }

    // Atualizar alocação do funcionário
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        contractId: contractId,
        currentContractId: contractId,
        contractAssignmentDate: contractAssignmentDate || new Date()
      },
      include: {
        currentContract: true,
        currentFunction: true
      }
    });

    return NextResponse.json({
      message: 'Alocação atualizada com sucesso',
      employee: updatedEmployee
    });

  } catch (error) {
    console.error('Erro ao atualizar alocação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/employees/[id]/assignment - Vincular funcionário em lote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { employeeIds, contractId, contractAssignmentDate } = body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: 'Lista de funcionários é obrigatória' },
        { status: 400 }
      );
    }

    if (!contractId) {
      return NextResponse.json(
        { error: 'ID do contrato é obrigatório' },
        { status: 400 }
      );
    }

    // Validar se o contrato existe e está ativo
    const contract = await prisma.contract.findFirst({
      where: {
        id: contractId,
        isActive: true
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado ou inativo' },
        { status: 400 }
      );
    }

    // Validar se todos os funcionários existem
    const existingEmployees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds }
      }
    });

    if (existingEmployees.length !== employeeIds.length) {
      return NextResponse.json(
        { error: 'Um ou mais funcionários não foram encontrados' },
        { status: 400 }
      );
    }

    // Atualizar alocação de todos os funcionários
    const updatePromises = employeeIds.map(employeeId =>
      prisma.employee.update({
        where: { id: employeeId },
        data: {
          contractId: contractId,
          currentContractId: contractId,
          contractAssignmentDate: contractAssignmentDate || new Date()
        }
      })
    );

    const updatedEmployees = await Promise.all(updatePromises);

    return NextResponse.json({
      message: `${updatedEmployees.length} funcionário(s) vinculado(s) com sucesso`,
      employees: updatedEmployees
    });

  } catch (error) {
    console.error('Erro ao vincular funcionários em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 