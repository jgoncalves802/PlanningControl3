import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { 
  CreateContractFunctionSchema,
  UpdateContractFunctionSchema 
} from '@/lib/types/contracts'

const prisma = new PrismaClient()

// GET /api/contracts/[id]/functions - Listar funções do contrato
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: contractId } = params

    // Verificar se contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
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

    // Buscar funções do contrato
    const functions = await prisma.contractFunction.findMany({
      where: { contractId },
      include: {
        _count: {
          select: { employees: true }
        },
        requiredTrainings: {
          include: {
            training: true
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })

    // Transformar dados
    const transformedFunctions = functions.map(func => ({
      ...func,
      employeeCount: func._count.employees
    }))

    return NextResponse.json(transformedFunctions, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar funções do contrato:', error)
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

// POST /api/contracts/[id]/functions - Criar função no contrato
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: contractId } = params
    const rawData = await request.json()
    
    // Adicionar contractId aos dados
    const dataWithContractId = { ...rawData, contractId }
    
    // Validar dados
    const validatedData = CreateContractFunctionSchema.parse(dataWithContractId)

    // Verificar se contrato existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
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

    // Verificar se função já existe no contrato
    const existingFunction = await prisma.contractFunction.findFirst({
      where: {
        contractId,
        name: validatedData.name
      }
    })

    if (existingFunction) {
      return NextResponse.json(
        { error: 'Já existe uma função com este nome neste contrato' },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }

    // Criar função
    const contractFunction = await prisma.contractFunction.create({
      data: validatedData,
      include: {
        _count: {
          select: { employees: true }
        }
      }
    })

    // Transformar resposta
    const transformedFunction = {
      ...contractFunction,
      employeeCount: contractFunction._count.employees
    }

    return NextResponse.json(transformedFunction, {
      status: 201,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao criar função do contrato:', error)
    
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