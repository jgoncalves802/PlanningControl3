import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contractId')
    const date = searchParams.get('date')
    
    // Define data range (default to today)
    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Build where clause for workforce entries
    const whereClause: any = {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    if (contractId && contractId !== 'all') {
      whereClause.employee = {
        currentContractId: contractId
      }
    }

    // Get all workforce entries for the day
    const workforceEntries = await prisma.workforceEntry.findMany({
      where: whereClause,
      include: {
        employee: true
      }
    })

    // Calculate statistics
    const totalEmployees = workforceEntries.length
    const present = workforceEntries.filter(e => e.status === 'present').length
    const absent = workforceEntries.filter(e => e.status === 'absent').length
    const late = workforceEntries.filter(e => e.status === 'late' || e.isLate).length
    const left = workforceEntries.filter(e => e.status === 'left').length

    // Calculate presence rate
    const presenceRate = totalEmployees > 0 
      ? Math.round(((present + late) / totalEmployees) * 100)
      : 0

    // Calculate average check-in time
    const checkInTimes = workforceEntries
      .filter(e => e.checkInTime)
      .map(e => e.checkInTime!)

    let averageCheckInTime = '08:00'
    if (checkInTimes.length > 0) {
      const totalMinutes = checkInTimes.reduce((sum, time) => {
        const hours = time.getHours()
        const minutes = time.getMinutes()
        return sum + (hours * 60) + minutes
      }, 0)
      
      const avgMinutes = Math.round(totalMinutes / checkInTimes.length)
      const avgHours = Math.floor(avgMinutes / 60)
      const avgMins = avgMinutes % 60
      averageCheckInTime = `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`
    }

    // Get contracts with presence
    const contractIds = [...new Set(workforceEntries.map(e => e.employee.currentContractId).filter(Boolean))]
    const contractsWithPresence = contractIds.length

    // Get contract workforce breakdown
    const contractWorkforce = await Promise.all(
      contractIds.map(async (contractId) => {
        const contractEntries = workforceEntries.filter(e => e.employee.currentContractId === contractId)
        
        // Get contract info
        const contract = await prisma.contract.findUnique({
          where: { id: contractId! }
        })

        // Get total assigned employees to this contract
        const totalAssigned = await prisma.employee.count({
          where: {
            currentContractId: contractId,
            isActive: true
          }
        })

        const contractPresent = contractEntries.filter(e => e.status === 'present').length
        const contractAbsent = totalAssigned - contractEntries.length // Employees not checked in
        const contractLate = contractEntries.filter(e => e.status === 'late' || e.isLate).length
        const contractLeft = contractEntries.filter(e => e.status === 'left').length

        const contractPresenceRate = totalAssigned > 0 
          ? Math.round(((contractPresent + contractLate) / totalAssigned) * 100)
          : 0

        return {
          contractId: contractId!,
          contractName: contract?.name || 'Contrato Desconhecido',
          totalAssigned,
          present: contractPresent,
          absent: contractAbsent,
          late: contractLate,
          left: contractLeft,
          presenceRate: contractPresenceRate,
          entries: contractEntries.map(entry => ({
            id: entry.id,
            employeeId: entry.employeeId,
            employeeName: entry.employee.name,
            checkInTime: entry.checkInTime,
            checkOutTime: entry.checkOutTime,
            status: entry.status,
            location: entry.location,
            isLate: entry.isLate,
            hoursWorked: entry.hoursWorked
          }))
        }
      })
    )

    const stats = {
      totalEmployees,
      present,
      absent,
      late,
      left,
      presenceRate,
      averageCheckInTime,
      contractsWithPresence,
      contractWorkforce,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas de efetivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas de efetivo' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 