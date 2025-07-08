import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG: Iniciando API workforce ===')
    
    // Teste básico do Prisma
    console.log('=== DEBUG: Testando conexão Prisma ===')
    const employeeCount = await prisma.employee.count()
    console.log('=== DEBUG: Funcionários encontrados:', employeeCount, '===')
    
    // Verificar se a tabela workforceEntry existe
    console.log('=== DEBUG: Testando tabela WorkforceEntry ===')
    let entries = []
    try {
      const workforceEntries = await prisma.workforceEntry.findMany({
        take: 10, // Limitando para teste
        include: {
          employee: {
            select: {
              name: true,
              currentContractId: true,
              companyFunctionId: true,
              nfcCardId: true,
              companyFunction: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      
      console.log('=== DEBUG: Registros de efetivo encontrados:', workforceEntries.length, '===')
      
      entries = workforceEntries.map(entry => ({
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: entry.employee.name,
        contractId: entry.employee.currentContractId || '',
        contractName: entry.contractName || '',
        functionId: entry.employee.companyFunctionId || '',
        functionName: entry.employee.companyFunction?.name || '',
        checkInTime: entry.checkInTime,
        checkOutTime: entry.checkOutTime,
        status: entry.status,
        location: entry.location,
        nfcCardId: entry.employee.nfcCardId,
        isLate: entry.isLate,
        hoursWorked: entry.hoursWorked,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }))
      
    } catch (error) {
      console.error('=== DEBUG: Erro ao acessar WorkforceEntry:', error)
    }

    console.log('=== DEBUG: Retornando', entries.length, 'registros ===')

    return NextResponse.json(entries, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('=== DEBUG: Erro na API workforce:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar dados de efetivo', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG: Iniciando POST workforce ===')
    const body = await request.json()
    console.log('=== DEBUG: Body recebido:', body, '===')
    
    return NextResponse.json({ message: 'Teste OK', body }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('=== DEBUG: Erro no POST workforce:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar registro de efetivo', details: error.message },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 