import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-server'
import { getCompanyFilters } from '@/lib/auth-client'
import { emitContractEvent } from './events/route';

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
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit

    // Obter filtros de empresa baseados no role do usuário
    const companyFilters = getCompanyFilters(session.user)

    // Construir where clause
    const where: any = {
      ...companyFilters // Aplicar filtros de empresa
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Buscar contratos com paginação simples
    const [contracts, totalCount] = await Promise.all([
      prisma.contract.findMany({
        where,
        take: limit,
        skip: skip,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              employees: true,
              functions: true
            }
          }
        }
      }),
      prisma.contract.count({ where })
    ])

    // Normalizar dados dos contratos
    const normalizedContracts = contracts.map((contract) => {
      const normalized = normalizeContractFields(contract)
      return {
        ...normalized,
        employeeCount: contract._count?.employees || 0,
        functionCount: contract._count?.functions || 0
      }
    })

    const totalPages = Math.ceil(totalCount / limit)

    const response = {
      contracts: normalizedContracts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contracts - Criar novo contrato
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário pode criar contratos
    if (session.user.role === 'USER') {
      return NextResponse.json({ error: 'Sem permissão para criar contratos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, code, workdayHours, includesWeekends, includesHolidays } = body

    // Normalizar dados
    const normalizedData = normalizeContractFields(body)

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

    // Verificar se já existe contrato com mesmo código na empresa do usuário
    if (code) {
      const whereClause: any = { code: code.trim().toUpperCase() }
      
      // Aplicar filtro de empresa se não for SUPER_ADMIN
      if (session.user.role !== 'SUPER_ADMIN') {
        whereClause.companyId = session.user.companyId
      }
      
      const existingContract = await prisma.contract.findFirst({
        where: whereClause
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

    // Preparar dados para criação
    const contractData: any = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      workdayHours: Number(workdayHours),
      includesWeekends: Boolean(includesWeekends || false),
      includesHolidays: Boolean(includesHolidays || false),
      isActive: true
    }

    // Aplicar companyId baseado no role do usuário
    if (session.user.role === 'COMPANY_ADMIN') {
      // COMPANY_ADMIN só pode criar contratos para sua própria empresa
      contractData.companyId = session.user.companyId
    }
    // SUPER_ADMIN pode criar contratos para qualquer empresa (companyId vem do request)

    // Criar contrato
    const newContract = await prisma.contract.create({
      data: contractData,
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

    // Emitir evento SSE
    emitContractEvent('created', newContract);
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
