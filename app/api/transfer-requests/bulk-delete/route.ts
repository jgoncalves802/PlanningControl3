import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json({
        error: 'ID do funcionário é obrigatório'
      }, {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }

    // Verificar se o funcionário existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json({
        error: 'Funcionário não encontrado'
      }, {
        status: 404,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }

    // Buscar transferências associadas
    const transferRequests = await prisma.transferRequest.findMany({
      where: { employeeId: employeeId }
    });

    if (transferRequests.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma transferência encontrada para este funcionário',
        deletedCount: 0
      }, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }

    // Deletar todas as transferências associadas
    const deleteResult = await prisma.transferRequest.deleteMany({
      where: { employeeId: employeeId }
    });

    return NextResponse.json({
      message: `${deleteResult.count} transferência(s) removida(s) com sucesso`,
      deletedCount: deleteResult.count,
      employeeName: employee.name
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Erro ao deletar transferências:', error);
    
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error.message
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
} 
