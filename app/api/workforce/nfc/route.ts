import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nfcCardId, location, action } = body

    // Validar campos obrigatórios
    if (!nfcCardId) {
      return NextResponse.json(
        { error: 'ID do cartão NFC é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar funcionário pelo cartão NFC
    const employee = await prisma.employee.findUnique({
      where: { nfcCardId },
      include: {
        companyFunction: true,
        currentContract: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado para este cartão NFC' },
        { status: 404 }
      )
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { error: 'Funcionário não está ativo' },
        { status: 400 }
      )
    }

    // Verificar se já existe registro para hoje
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const existingEntry = await prisma.workforceEntry.findFirst({
      where: {
        employeeId: employee.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const now = new Date()
    
    if (existingEntry) {
      // Atualizar registro existente
      let updateData: any = {
        updatedAt: now
      }

      if (action === 'check_in' && !existingEntry.checkInTime) {
        // Primeiro check-in do dia
        const lateThreshold = new Date(now)
        lateThreshold.setHours(8, 15, 0, 0)
        const isLate = now > lateThreshold

        updateData = {
          ...updateData,
          checkInTime: now,
          status: isLate ? 'LATE' : 'PRESENT',
          isLate,
          location
        }
      } else if (action === 'check_out' && existingEntry.checkInTime && !existingEntry.checkOutTime) {
        // Check-out
        const checkInTime = existingEntry.checkInTime
        const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

        updateData = {
          ...updateData,
          checkOutTime: now,
          status: 'LEFT',
          hoursWorked,
          location
        }
      } else {
        return NextResponse.json(
          { error: 'Ação NFC inválida para o estado atual do funcionário' },
          { status: 400 }
        )
      }

      const updatedEntry = await prisma.workforceEntry.update({
        where: { id: existingEntry.id },
        data: updateData,
        include: {
          employee: {
            include: {
              companyFunction: true
            }
          }
        }
      })

      const response = {
        id: updatedEntry.id,
        employeeId: updatedEntry.employeeId,
        employeeName: updatedEntry.employee.name,
        contractId: updatedEntry.employee.currentContractId || '',
        contractName: updatedEntry.contractName || '',
        functionId: updatedEntry.employee.companyFunctionId || '',
        functionName: updatedEntry.employee.companyFunction?.name || '',
        checkInTime: updatedEntry.checkInTime,
        checkOutTime: updatedEntry.checkOutTime,
        status: updatedEntry.status,
        location: updatedEntry.location,
        nfcCardId: updatedEntry.employee.nfcCardId,
        isLate: updatedEntry.isLate,
        hoursWorked: updatedEntry.hoursWorked,
        action: action,
        message: action === 'check_in' ? 'Check-in realizado com sucesso' : 'Check-out realizado com sucesso'
      }

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })

    } else {
      // Criar novo registro
      if (action !== 'check_in') {
        return NextResponse.json(
          { error: 'Primeiro registro do dia deve ser check-in' },
          { status: 400 }
        )
      }

      const lateThreshold = new Date(now)
      lateThreshold.setHours(8, 15, 0, 0)
      const isLate = now > lateThreshold

      const newEntry = await prisma.workforceEntry.create({
        data: {
          employeeId: employee.id,
          checkInTime: now,
          status: isLate ? 'LATE' : 'PRESENT',
          location,
          isLate,
          contractName: employee.currentContract?.name || ''
        },
        include: {
          employee: {
            include: {
              companyFunction: true
            }
          }
        }
      })

      const response = {
        id: newEntry.id,
        employeeId: newEntry.employeeId,
        employeeName: newEntry.employee.name,
        contractId: newEntry.employee.currentContractId || '',
        contractName: newEntry.contractName || '',
        functionId: newEntry.employee.companyFunctionId || '',
        functionName: newEntry.employee.companyFunction?.name || '',
        checkInTime: newEntry.checkInTime,
        checkOutTime: newEntry.checkOutTime,
        status: newEntry.status,
        location: newEntry.location,
        nfcCardId: newEntry.employee.nfcCardId,
        isLate: newEntry.isLate,
        hoursWorked: newEntry.hoursWorked,
        action: action,
        message: `Check-in realizado com sucesso${isLate ? ' (ATRASADO)' : ''}`
      }

      return NextResponse.json(response, {
        status: 201,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
    }

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