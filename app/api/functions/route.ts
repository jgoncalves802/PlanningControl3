import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/functions - Listar todas as funções
export async function GET(request: NextRequest) {
  try {

    
    const { searchParams } = new URL(request.url)
    const laborType = searchParams.get('laborType')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')
    
    const where: any = {}
    
    // Filtrar por tipo de mão de obra
    if (laborType && (laborType === 'DIRETO' || laborType === 'INDIRETO')) {
      where.laborType = laborType
    }
    
    // Filtrar por status ativo/inativo
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    // Busca por nome
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    const functions = await prisma.companyFunction.findMany({
      where,
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })
    

    
    return NextResponse.json(functions, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar funções:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  }
}

// POST /api/functions - Criar nova função
export async function POST(request: NextRequest) {
  try {

    
    const body = await request.json()

    
    const { name, laborType } = body
    
    // Validações
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome da função é obrigatório' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    if (!laborType || (laborType !== 'DIRETO' && laborType !== 'INDIRETO')) {
      return NextResponse.json(
        { error: 'Tipo de mão de obra deve ser DIRETO ou INDIRETO' },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    // Verificar se já existe função com mesmo nome
    const existingFunction = await prisma.companyFunction.findUnique({
      where: { name: name.trim().toUpperCase() }
    })
    
    if (existingFunction) {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome' },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    // Criar função
    const newFunction = await prisma.companyFunction.create({
      data: {
        name: name.trim().toUpperCase(),
        laborType: laborType,
        isActive: true
      },
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    })
    

    
    return NextResponse.json(newFunction, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao criar função:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  }
} 
