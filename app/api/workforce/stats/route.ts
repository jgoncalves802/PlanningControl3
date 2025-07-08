import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Iniciando API workforce/stats ===')
    
    // Teste básico do Prisma
    console.log('=== DEBUG: Testando conexão Prisma ===')
    const employeeCount = await prisma.employee.count()
    console.log('=== DEBUG: Funcionários encontrados:', employeeCount, '===')
    
    // Verificar se a tabela workforceEntry existe
    console.log('=== DEBUG: Testando tabela WorkforceEntry ===')
    let workforceCount = 0
    try {
      workforceCount = await prisma.workforceEntry.count()
      console.log('=== DEBUG: Registros de efetivo encontrados:', workforceCount, '===')
    } catch (error) {
      console.error('=== DEBUG: Erro ao acessar WorkforceEntry:', error)
    }

    const stats = {
      totalEmployees: employeeCount,
      present: 0,
      absent: 0,
      late: 0,
      left: 0,
      presenceRate: 0,
      averageCheckInTime: '08:00',
      contractsWithPresence: 0,
      contractWorkforce: [],
      workforceEntries: workforceCount,
      lastUpdated: new Date().toISOString()
    }

    console.log('=== DEBUG: Retornando stats:', stats, '===')

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('=== DEBUG: Erro na API stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas de efetivo', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 