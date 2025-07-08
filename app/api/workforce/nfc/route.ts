import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nfcCardId, location, action } = body

    // Validate required fields
    if (!nfcCardId) {
      return NextResponse.json(
        { error: 'ID do cartão NFC é obrigatório' },
        { status: 400 }
      )
    }

    // Find employee by NFC card
    const employee = await prisma.employee.findFirst({
      where: { 
        nfcCardId: nfcCardId,
        isActive: true 
      },
      include: {
        companyFunction: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado para este cartão NFC' },
        { status: 404 }
      )
    }

    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Check if employee already has an entry for today
    const existingEntry = await prisma.workforceEntry.findFirst({
      where: {
        employeeId: employee.id,
        createdAt: {
          gte: today,
          lte: endOfDay
        }
      }
    })

    // Get contract info
    let contractName = ''
    if (employee.currentContractId) {
      const contract = await prisma.contract.findUnique({
        where: { id: employee.currentContractId }
      })
      contractName = contract?.name || ''
    }

    let workforceEntry

    if (existingEntry) {
      // Update existing entry
      if (action === 'check_out' || (!existingEntry.checkOutTime && existingEntry.checkInTime)) {
        // Check out
        const checkInTime = existingEntry.checkInTime || existingEntry.createdAt
        const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
        
        workforceEntry = await prisma.workforceEntry.update({
          where: { id: existingEntry.id },
          data: {
            checkOutTime: now,
            status: 'left',
            hoursWorked: Math.round(hoursWorked * 100) / 100, // Round to 2 decimal places
            location: location || existingEntry.location,
            updatedAt: now
          },
          include: {
            employee: {
              include: {
                companyFunction: true
              }
            }
          }
        })
      } else {
        // Already checked in today
        return NextResponse.json({
          message: 'Funcionário já registrou presença hoje',
          entry: {
            id: existingEntry.id,
            employeeId: existingEntry.employeeId,
            employeeName: employee.name,
            checkInTime: existingEntry.checkInTime,
            checkOutTime: existingEntry.checkOutTime,
            status: existingEntry.status
          }
        }, { status: 200 })
      }
    } else {
      // Create new entry (check in)
      const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15)
      const status = isLate ? 'late' : 'present'

      workforceEntry = await prisma.workforceEntry.create({
        data: {
          employeeId: employee.id,
          checkInTime: now,
          status,
          location: location || `Setor ${Math.floor(Math.random() * 5) + 1}`,
          isLate,
          hoursWorked: 0,
          contractName
        },
        include: {
          employee: {
            include: {
              companyFunction: true
            }
          }
        }
      })
    }

    // Transform response
    const response = {
      id: workforceEntry.id,
      employeeId: workforceEntry.employeeId,
      employeeName: workforceEntry.employee.name,
      contractId: workforceEntry.employee.currentContractId || '',
      contractName: workforceEntry.contractName || '',
      functionId: workforceEntry.employee.companyFunctionId || '',
      functionName: workforceEntry.employee.companyFunction?.name || '',
      checkInTime: workforceEntry.checkInTime,
      checkOutTime: workforceEntry.checkOutTime,
      status: workforceEntry.status,
      location: workforceEntry.location,
      nfcCardId: workforceEntry.employee.nfcCardId,
      isLate: workforceEntry.isLate,
      hoursWorked: workforceEntry.hoursWorked,
      action: workforceEntry.checkOutTime ? 'check_out' : 'check_in',
      message: workforceEntry.checkOutTime 
        ? `Saída registrada para ${workforceEntry.employee.name}`
        : `Entrada registrada para ${workforceEntry.employee.name}${workforceEntry.isLate ? ' (ATRASADO)' : ''}`,
      createdAt: workforceEntry.createdAt,
      updatedAt: workforceEntry.updatedAt
    }

    return NextResponse.json(response, {
      status: existingEntry ? 200 : 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    })

  } catch (error) {
    console.error('Erro ao processar leitura NFC:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar leitura NFC' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
} 