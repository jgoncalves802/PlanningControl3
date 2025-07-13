import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const contractId = searchParams.get('contractId')
    const date = dateParam ? new Date(dateParam) : new Date()
    const dateStr = date.toISOString().split('T')[0]

    // Filtro de data para o dia
    const dateFilter = {
      gte: new Date(dateStr + 'T00:00:00.000Z'),
      lte: new Date(dateStr + 'T23:59:59.999Z'),
    }

    // Se houver filtro de contrato, calcular apenas para ele
    if (contractId && contractId !== 'all') {
      const employeeCount = await prisma.employee.count({ where: { contractId } })
      const entries = await prisma.workforceEntry.findMany({
        where: {
          contractId,
          createdAt: dateFilter,
        },
        select: {
          status: true,
          checkInTime: true,
          isLate: true,
        },
      })
      let present = 0, absent = 0, late = 0, left = 0
      let totalCheckInMinutes = 0, checkInCount = 0
      for (const entry of entries) {
        if (entry.status === 'PRESENT') present++
        if (entry.status === 'ABSENT') absent++
        if (entry.status === 'LATE') late++
        if (entry.status === 'LEFT') left++
        if (entry.checkInTime) {
          const d = new Date(entry.checkInTime)
          totalCheckInMinutes += d.getUTCHours() * 60 + d.getUTCMinutes()
          checkInCount++
        }
      }
      let averageCheckInTime = '08:00'
      if (checkInCount > 0) {
        const avgMinutes = Math.round(totalCheckInMinutes / checkInCount)
        const h = String(Math.floor(avgMinutes / 60)).padStart(2, '0')
        const m = String(avgMinutes % 60).padStart(2, '0')
        averageCheckInTime = `${h}:${m}`
      }
      const presenceRate = employeeCount > 0 ? Math.round((present / employeeCount) * 100) : 0
      const stats = {
        totalEmployees: employeeCount,
        present,
        absent,
        late,
        left,
        presenceRate,
        averageCheckInTime,
        contractsWithPresence: 1,
        contractWorkforce: [],
        workforceEntries: entries.length,
        lastUpdated: new Date().toISOString()
      }
      return NextResponse.json(stats, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }

    // Sem filtro de contrato: calcular globais e por contrato
    const contracts = await prisma.contract.findMany({
      select: { id: true, name: true }
    })
    const employees = await prisma.employee.findMany({ select: { id: true, contractId: true } })
    const entries = await prisma.workforceEntry.findMany({
      where: { createdAt: dateFilter },
      select: { status: true, contractId: true, checkInTime: true, isLate: true },
    })
    // Globais
    let present = 0, absent = 0, late = 0, left = 0
    let totalCheckInMinutes = 0, checkInCount = 0
    const contractsSet = new Set()
    for (const entry of entries) {
      if (entry.status === 'PRESENT') present++
      if (entry.status === 'ABSENT') absent++
      if (entry.status === 'LATE') late++
      if (entry.status === 'LEFT') left++
      if (entry.contractId) contractsSet.add(entry.contractId)
      if (entry.checkInTime) {
        const d = new Date(entry.checkInTime)
        totalCheckInMinutes += d.getUTCHours() * 60 + d.getUTCMinutes()
        checkInCount++
      }
    }
    let averageCheckInTime = '08:00'
    if (checkInCount > 0) {
      const avgMinutes = Math.round(totalCheckInMinutes / checkInCount)
      const h = String(Math.floor(avgMinutes / 60)).padStart(2, '0')
      const m = String(avgMinutes % 60).padStart(2, '0')
      averageCheckInTime = `${h}:${m}`
    }
    const presenceRate = employees.length > 0 ? Math.round((present / employees.length) * 100) : 0
    // Por contrato
    const contractWorkforce = contracts.map(contract => {
      const contractEmployees = employees.filter(e => e.contractId === contract.id)
      const contractEntries = entries.filter(e => e.contractId === contract.id)
      let cPresent = 0, cAbsent = 0, cLate = 0, cLeft = 0
      for (const entry of contractEntries) {
        if (entry.status === 'PRESENT') cPresent++
        if (entry.status === 'ABSENT') cAbsent++
        if (entry.status === 'LATE') cLate++
        if (entry.status === 'LEFT') cLeft++
      }
      return {
        contractId: contract.id,
        contractName: contract.name,
        totalEmployees: contractEmployees.length,
        present: cPresent,
        absent: cAbsent,
        late: cLate,
        left: cLeft,
      }
    })
    const stats = {
      totalEmployees: employees.length,
      present,
      absent,
      late,
      left,
      presenceRate,
      averageCheckInTime,
      contractsWithPresence: contractsSet.size,
      contractWorkforce,
      workforceEntries: entries.length,
      lastUpdated: new Date().toISOString()
    }
    return NextResponse.json(stats, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
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