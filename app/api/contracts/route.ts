import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Função para normalizar caracteres especiais e garantir UTF-8
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text
  
  return text
    .normalize('NFC')
    .trim()
}

// Função para processar campos de texto de um contrato
function normalizeContractFields(data: any): any {
  const normalized = { ...data }
  
  const textFields = ['name', 'code']
  textFields.forEach(field => {
    if (normalized[field] && typeof normalized[field] === 'string') {
      normalized[field] = normalizeText(normalized[field])
    }
  })
  
  return normalized
}

// GET /api/contracts - Listar contratos com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/contracts ===')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const includesWeekends = searchParams.get('includesWeekends')
    const includesHolidays = searchParams.get('includesHolidays')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (includesWeekends !== null && includesWeekends !== undefined) {
      where.includesWeekends = includesWeekends === 'true'
    }

    if (includesHolidays !== null && includesHolidays !== undefined) {
      where.includesHolidays = includesHolidays === 'true'
    }

    // Buscar contratos com relacionamentos
    const contracts = await prisma.contract.findMany({
      where,
      include: {
        responsibles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        functions: {
          include: {
            _count: {
              select: {
                employees: true
              }
            }
          }
        },
        _count: {
          select: {
            employees: true,
            functions: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      }
    })

    // Contar total
    const total = await prisma.contract.count({ where })

    // Formatar resposta com campos calculados
    const formattedContracts = contracts.map(contract => ({
      ...contract,
      employeeCount: contract._count.employees,
      functionCount: contract._count.functions,
      functions: contract.functions.map(func => ({
        ...func,
        employeeCount: func._count.employees
      }))
    }))

    console.log(`Encontrados ${contracts.length} contratos`)

    return NextResponse.json({
      contracts: formattedContracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
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

// POST /api/contracts - Criar novo contrato
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/contracts ===')
    
    const rawData = await request.json()
    const data = normalizeContractFields(rawData)
    console.log('Dados recebidos:', data)

    const { name, code, workdayHours, includesWeekends, includesHolidays } = data

    // Validações
    const errors: Record<string, string> = {}

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.name = 'Nome do contrato é obrigatório'
    } else if (name.length > 100) {
      errors.name = 'Nome deve ter no máximo 100 caracteres'
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      errors.code = 'Código do contrato é obrigatório'
    } else if (code.length > 50) {
      errors.code = 'Código deve ter no máximo 50 caracteres'
    }

    if (workdayHours === undefined || workdayHours === null) {
      errors.workdayHours = 'Horas de trabalho por dia é obrigatório'
    } else if (typeof workdayHours !== 'number' || workdayHours <= 0 || workdayHours > 24) {
      errors.workdayHours = 'Horas de trabalho deve ser um número entre 1 e 24'
    }

    // Verificar se já existe contrato com mesmo código
    if (code) {
      const existingContract = await prisma.contract.findUnique({
        where: { code: code.trim().toUpperCase() }
      })

      if (existingContract) {
        errors.code = 'Já existe um contrato com este código'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
    }

    // Criar contrato
    const newContract = await prisma.contract.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        workdayHours: Number(workdayHours),
        includesWeekends: Boolean(includesWeekends || false),
        includesHolidays: Boolean(includesHolidays || false),
        isActive: true
      },
      include: {
        responsibles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        functions: true,
        _count: {
          select: {
            employees: true,
            functions: true
          }
        }
      }
    })

    console.log('Contrato criado:', newContract)

    return NextResponse.json({
      ...newContract,
      employeeCount: newContract._count.employees,
      functionCount: newContract._count.functions
    }, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
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