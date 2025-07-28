import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/contracts/active - Listar contratos ativos para receber colaboradores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const includeFunctions = searchParams.get('includeFunctions') === 'true';
    const includeEmployeeCount = searchParams.get('includeEmployeeCount') === 'true';

    // Construir where clause para contratos ativos
    const where: any = {
      isActive: true // Apenas contratos ativos
    };

    // Adicionar busca se fornecida
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar contratos ativos
    const contracts = await prisma.contract.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        workdayHours: true,
        includesWeekends: true,
        includesHolidays: true,
        createdAt: true,
        updatedAt: true,
        // Incluir funções se solicitado
        ...(includeFunctions && {
          functions: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              isActive: true,
              _count: {
                select: { employees: true }
              }
            },
            orderBy: { name: 'asc' }
          }
        }),
        // Incluir contagem de funcionários se solicitado
        ...(includeEmployeeCount && {
          _count: {
            select: { employees: true }
          }
        })
      },
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Processar dados dos contratos
    const processedContracts = contracts.map(contract => {
      const baseContract = {
        id: contract.id,
        name: contract.name,
        code: contract.code,
        isActive: contract.isActive,
        workdayHours: contract.workdayHours,
        includesWeekends: contract.includesWeekends,
        includesHolidays: contract.includesHolidays,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
      };

      // Adicionar funções se incluídas
      if (includeFunctions && contract.functions) {
        return {
          ...baseContract,
          functions: contract.functions.map(func => ({
            id: func.id,
            name: func.name,
            isActive: func.isActive,
            employeeCount: func._count.employees
          }))
        };
      }

      // Adicionar contagem de funcionários se incluída
      if (includeEmployeeCount && contract._count) {
        return {
          ...baseContract,
          employeeCount: contract._count.employees
        };
      }

      return baseContract;
    });

    return NextResponse.json({
      contracts: processedContracts,
      total: processedContracts.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar contratos ativos:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
} 