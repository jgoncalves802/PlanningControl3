import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Parallel queries for better performance
    const [
      totalEmployees,
      activeEmployees,
      totalContracts,
      activeContracts,
      totalFunctions,
      activeFunctions
    ] = await Promise.all([
      // Total employees
      prisma.employee.count(),
      
      // Active employees (considering isActive field)
      prisma.employee.count({
        where: { isActive: true }
      }),
      
      // Total contracts
      prisma.contract.count(),
      
      // Active contracts
      prisma.contract.count({
        where: { isActive: true }
      }),
      
      // Total functions
      prisma.companyFunction.count(),
      
      // Active functions
      prisma.companyFunction.count({
        where: { isActive: true }
      })
    ])

    // Calculate employees by labor type (based on their assigned functions)
    const employeesByLaborType = await prisma.employee.groupBy({
      by: ['companyFunctionId'],
      _count: {
        id: true
      },
      where: {
        isActive: true,
        companyFunctionId: {
          not: null
        }
      }
    })

    // Get labor type distribution
    const functionIds = employeesByLaborType
      .map(e => e.companyFunctionId)
      .filter(id => id !== null) as string[]

    let directLaborEmployees = 0
    let indirectLaborEmployees = 0

    if (functionIds.length > 0) {
      const functions = await prisma.companyFunction.findMany({
        where: {
          id: { in: functionIds }
        },
        select: {
          id: true,
          laborType: true
        }
      })

      const functionLaborMap = new Map(
        functions.map(f => [f.id, f.laborType])
      )

      employeesByLaborType.forEach(emp => {
        if (emp.companyFunctionId) {
          const laborType = functionLaborMap.get(emp.companyFunctionId)
          if (laborType === 'DIRETO') {
            directLaborEmployees += emp._count.id
          } else if (laborType === 'INDIRETO') {
            indirectLaborEmployees += emp._count.id
          }
        }
      })
    }

    // Calculate functions with employees assigned
    const functionsWithEmployees = await prisma.companyFunction.count({
      where: {
        isActive: true,
        employees: {
          some: {
            isActive: true
          }
        }
      }
    })

    // Calculate compliance rate (percentage of employees with functions assigned)
    const employeesWithFunctions = await prisma.employee.count({
      where: {
        isActive: true,
        companyFunctionId: {
          not: null
        }
      }
    })

    const complianceRate = activeEmployees > 0 
      ? Math.round((employeesWithFunctions / activeEmployees) * 100)
      : 0

    // Recent activity metrics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [recentEmployees, recentContracts, recentFunctions] = await Promise.all([
      prisma.employee.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      prisma.contract.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      prisma.companyFunction.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })
    ])

    const stats = {
      // Core metrics
      totalEmployees,
      activeEmployees,
      totalContracts,
      activeContracts,
      totalFunctions,
      activeFunctions,
      
      // Labor distribution
      directLaborEmployees,
      indirectLaborEmployees,
      
      // Assignment metrics
      functionsWithEmployees,
      employeesWithFunctions,
      complianceRate,
      
      // Recent activity (last 30 days)
      recentActivity: {
        employees: recentEmployees,
        contracts: recentContracts,
        functions: recentFunctions
      },
      
      // Calculated metrics
      averageEmployeesPerContract: activeContracts > 0 
        ? Math.round(activeEmployees / activeContracts)
        : 0,
      
      averageEmployeesPerFunction: activeFunctions > 0
        ? Math.round(activeEmployees / activeFunctions)
        : 0,
      
      // Timestamp
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 