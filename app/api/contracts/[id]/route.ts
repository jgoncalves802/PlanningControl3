import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { 
  UpdateContractSchema,
  transformContractDates,
  sanitizeContractData 
} from '@/lib/types/contracts'

const prisma = new PrismaClient()

// GET /api/contracts/[id] - Buscar contrato por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        functions: {
          include: {
            _count: {
              select: { employees: true }
            },
            requiredTrainings: {
              include: {
                training: true
              }
            }
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            cpf: true,
            isActive: true,
            currentFunction: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { employees: true }
        }
      }
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }

    // Transformar dados
    const transformedContract = {
      ...contract,
      employeeCount: contract._count.employees,
      functions: contract.functions.map(func => ({
        ...func,
        employeeCount: func._count.employees
      }))
    }

    return NextResponse.json(transformedContract, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar contrato:', error)
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

// PUT /api/contracts/[id] - Atualizar contrato
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const rawData = await request.json()
    
    // Sanitizar e transformar dados
    const sanitizedData = sanitizeContractData(rawData)
    const transformedData = transformContractDates(sanitizedData)
    
    // Validar dados
    const validatedData = UpdateContractSchema.parse(transformedData)

    // Verificar se contrato existe
    const existingContract = await prisma.contract.findUnique({
      where: { id }
    })

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }

    // Verificar se código já existe (se está sendo alterado)
    if (validatedData.code && validatedData.code !== existingContract.code) {
      const duplicateCode = await prisma.contract.findUnique({
        where: { code: validatedData.code }
      })

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Já existe um contrato com este código' },
          { 
            status: 409,
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
        )
      }
    }

    // Atualizar contrato
    const contract = await prisma.contract.update({
      where: { id },
      data: validatedData,
      include: {
        functions: {
          include: {
            _count: {
              select: { employees: true }
            }
          }
        },
        _count: {
          select: { employees: true }
        }
      }
    })

    // Transformar resposta
    const transformedContract = {
      ...contract,
      employeeCount: contract._count.employees,
      functions: contract.functions.map(func => ({
        ...func,
        employeeCount: func._count.employees
      }))
    }

    return NextResponse.json(transformedContract, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
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

// DELETE /api/contracts/[id] - Excluir contrato (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se contrato existe
    const existingContract = await prisma.contract.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }

    // Verificar se há funcionários associados
    if (existingContract._count.employees > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir contrato com funcionários associados',
          details: `Este contrato possui ${existingContract._count.employees} funcionário(s) associado(s)`
        },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }

    // Soft delete - marcar como inativo
    const contract = await prisma.contract.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(
      { 
        message: 'Contrato desativado com sucesso',
        contract: {
          id: contract.id,
          name: contract.name,
          code: contract.code,
          isActive: contract.isActive
        }
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  } catch (error) {
    console.error('Erro ao excluir contrato:', error)
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