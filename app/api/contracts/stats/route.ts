import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/contracts/stats - Estatísticas de contratos
export async function GET(request: NextRequest) {
  try {


    // Buscar estatísticas básicas
    const [
      totalContracts,
      activeContracts,
      inactiveContracts,
      contractsWithEmployees,
      contractsWithFunctions,
      totalEmployees,
      totalFunctions,
      averageWorkdayHours,
      contractsWithWeekends,
      contractsWithHolidays
    ] = await Promise.all([
      // Total de contratos
      prisma.contract.count(),
      
      // Contratos ativos
      prisma.contract.count({
        where: { isActive: true }
      }),
      
      // Contratos inativos
      prisma.contract.count({
        where: { isActive: false }
      }),
      
      // Contratos com funcionários
      prisma.contract.count({
        where: {
          employees: {
            some: {}
          }
        }
      }),
      
      // Contratos com funções
      prisma.contract.count({
        where: {
          functions: {
            some: {}
          }
        }
      }),
      
      // Total de funcionários em contratos
      prisma.employee.count({
        where: {
          currentContractId: {
            not: null
          },
          isActive: true
        }
      }),
      
      // Total de funções em contratos
      prisma.contractFunction.count({
        where: {
          isActive: true
        }
      }),
      
      // Média de horas de trabalho por dia
      prisma.contract.aggregate({
        _avg: {
          workdayHours: true
        },
        where: {
          isActive: true
        }
      }),
      
      // Contratos que incluem fins de semana
      prisma.contract.count({
        where: {
          isActive: true,
          includesWeekends: true
        }
      }),
      
      // Contratos que incluem feriados
      prisma.contract.count({
        where: {
          isActive: true,
          includesHolidays: true
        }
      })
    ])

    // Buscar contratos por faixa de horas de trabalho
    const contractsByWorkdayHours = await prisma.contract.groupBy({
      by: ['workdayHours'],
      where: { isActive: true },
      _count: {
        id: true
      },
      orderBy: {
        workdayHours: 'asc'
      }
    })

    // Buscar top 5 contratos com mais funcionários
    const topContractsByEmployees = await prisma.contract.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: {
        employees: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Buscar top 5 contratos com mais funções
    const topContractsByFunctions = await prisma.contract.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            functions: true
          }
        }
      },
      orderBy: {
        functions: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Contratos criados nos últimos 30 dias
    const recentContracts = await prisma.contract.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
        }
      }
    })

    const stats = {
      // Estatísticas básicas
      totalContracts,
      activeContracts,
      inactiveContracts,
      contractsWithEmployees,
      contractsWithFunctions,
      totalEmployees,
      totalFunctions,
      recentContracts,
      
      // Médias e percentuais
      averageWorkdayHours: Number(averageWorkdayHours._avg.workdayHours?.toFixed(1)) || 0,
      contractsWithWeekends,
      contractsWithHolidays,
      weekendPercentage: activeContracts > 0 ? Number(((contractsWithWeekends / activeContracts) * 100).toFixed(1)) : 0,
      holidayPercentage: activeContracts > 0 ? Number(((contractsWithHolidays / activeContracts) * 100).toFixed(1)) : 0,
      
      // Distribuições
      contractsByWorkdayHours: contractsByWorkdayHours.map(item => ({
        workdayHours: item.workdayHours,
        count: item._count.id
      })),
      
      // Rankings
      topContractsByEmployees: topContractsByEmployees.map(contract => ({
        id: contract.id,
        name: contract.name,
        code: contract.code,
        employeeCount: contract._count.employees
      })),
      
      topContractsByFunctions: topContractsByFunctions.map(contract => ({
        id: contract.id,
        name: contract.name,
        code: contract.code,
        functionCount: contract._count.functions
      }))
    }

    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao calcular estatísticas de contratos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  }
} 
