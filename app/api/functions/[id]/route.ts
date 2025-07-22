import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/functions/[id] - Buscar função por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
  
    
    const companyFunction = await prisma.companyFunction.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    })
    
    if (!companyFunction) {
      return NextResponse.json(
        { error: 'Função não encontrada' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    return NextResponse.json(companyFunction, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar função:', error)
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

// PUT /api/functions/[id] - Atualizar função
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const { name, laborType, isActive } = body
    
    // Verificar se a função existe
    const existingFunction = await prisma.companyFunction.findUnique({
      where: { id }
    })
    
    if (!existingFunction) {
      return NextResponse.json(
        { error: 'Função não encontrada' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    // Validações
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
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
      
      // Verificar se já existe outra função com mesmo nome
      const duplicateFunction = await prisma.companyFunction.findFirst({
        where: { 
          name: name.trim().toUpperCase(),
          id: { not: id }
        }
      })
      
      if (duplicateFunction) {
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
    }
    
    if (laborType !== undefined && laborType !== 'DIRETO' && laborType !== 'INDIRETO') {
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
    
    // Preparar dados para atualização
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim().toUpperCase()
    if (laborType !== undefined) updateData.laborType = laborType
    if (isActive !== undefined) updateData.isActive = isActive
    
    // Atualizar função
    const updatedFunction = await prisma.companyFunction.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    })
    
    
    
    return NextResponse.json(updatedFunction, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Erro ao atualizar função:', error)
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

// DELETE /api/functions/[id] - Excluir função
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    
    // Verificar se a função existe
    const existingFunction = await prisma.companyFunction.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    })
    
    if (!existingFunction) {
      return NextResponse.json(
        { error: 'Função não encontrada' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    // Verificar se há funcionários associados
    if (existingFunction._count.employees > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível excluir esta função pois existem ${existingFunction._count.employees} funcionário(s) associado(s)`,
          employeeCount: existingFunction._count.employees
        },
        { 
          status: 409,
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      )
    }
    
    // Excluir função
    await prisma.companyFunction.delete({
      where: { id }
    })
    
    
    
    return NextResponse.json(
      { message: 'Função excluída com sucesso' },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
  } catch (error) {
    console.error('Erro ao excluir função:', error)
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