import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')
    const date = searchParams.get('date') // formato yyyy-mm-dd
    const search = searchParams.get('search')
    let page = parseInt(searchParams.get('page') || '1', 10)
    if (isNaN(page) || page < 1) page = 1
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // Montar filtro
    let where: any = {}
    if (date) {
      const from = new Date(date)
      from.setHours(0, 0, 0, 0)
      const to = new Date(date)
      to.setHours(23, 59, 59, 999)
      // Filtro de contrato dentro do OR
      if (contractId) {
        where.OR = [
          { checkInTime: { gte: from, lte: to }, employee: { currentContractId: contractId } },
          { checkOutTime: { gte: from, lte: to }, employee: { currentContractId: contractId } }
        ]
      } else {
        where.OR = [
          { checkInTime: { gte: from, lte: to } },
          { checkOutTime: { gte: from, lte: to } }
        ]
      }
    } else if (contractId) {
      where.employee = { currentContractId: contractId }
    }
    if (search) {
      where.OR = [
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { contractName: { contains: search, mode: 'insensitive' } },
        { employee: { companyFunction: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    // Buscar total de registros
    const total = await prisma.workforceEntry.count({ where })

    // Buscar registros paginados
    const workforceEntries = await prisma.workforceEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            name: true,
            currentContractId: true,
            companyFunctionId: true,
            nfcCardId: true,
            companyFunction: {
              select: { name: true }
            },
            currentContract: {
              select: { name: true }
            }
          }
        }
      },
      skip,
      take: limit,
    })

    // Agrupar por contrato
    const contractGroups = new Map()
    
    workforceEntries.forEach(entry => {
      const contractName = entry.contractName || entry.employee.currentContract?.name || 'Sem Contrato'
      const contractId = entry.employee.currentContractId || 'no-contract'
      
      if (!contractGroups.has(contractId)) {
        contractGroups.set(contractId, {
          contractId,
          contractName,
          entries: [],
          stats: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            left: 0
          }
        })
      }
      
      const group = contractGroups.get(contractId)
      const formattedEntry = {
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: entry.employee.name,
        contractId: entry.employee.currentContractId || '',
        contractName: contractName,
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
      }
      
      group.entries.push(formattedEntry)
      group.stats.total++
      
      // Calcular estatísticas por status
      switch (entry.status) {
        case 'PRESENT':
          group.stats.present++
          break
        case 'ABSENT':
          group.stats.absent++
          break
        case 'LATE':
          group.stats.late++
          break
        case 'LEFT':
          group.stats.left++
          break
      }
    })

    const contractGroupsArray = Array.from(contractGroups.values())
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      contractGroups: contractGroupsArray,
      total,
      page,
      totalPages,
      limit,
      // Manter compatibilidade com formato antigo
      entries: workforceEntries.map(entry => ({
        id: entry.id,
        employeeId: entry.employeeId,
        employeeName: entry.employee.name,
        contractId: entry.employee.currentContractId || '',
        contractName: entry.contractName || entry.employee.currentContract?.name || '',
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
    }, {
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