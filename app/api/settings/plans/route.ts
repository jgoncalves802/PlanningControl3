import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from '@/lib/auth-server'

const prisma = new PrismaClient()

// GET - Listar planos disponíveis
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode listar planos
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para listar planos' }, { status: 403 })
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        price: 'asc'
      }
    })

    return NextResponse.json({ plans })

  } catch (error) {
    console.error('Erro ao listar planos:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// POST - Criar novo plano (apenas SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode criar planos
    if (session.user.role !== 'SUPER_ADMIN') {
      console.error(`🚨 Tentativa de criação de plano por usuário não autorizado: ${session.user.email} (${session.user.role})`)
      
      // Log de auditoria para tentativa não autorizada
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'PLAN_CREATION_ATTEMPT',
            entityId: 'N/A',
            details: {
              attemptedBy: session.user.email,
              attemptedByRole: session.user.role,
              timestamp: new Date().toISOString(),
              blocked: true
            }
          }
        })
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
      
      return NextResponse.json({ error: 'Apenas Super Administradores podem criar planos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, maxUsers, price, billingCycle, features, isDefault } = body

    // Validações básicas
    if (!name || !maxUsers || !price || !features) {
      return NextResponse.json({ 
        error: 'Nome, limite de usuários, preço e recursos são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se o nome já existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name }
    })

    if (existingPlan) {
      return NextResponse.json({ 
        error: 'Já existe um plano com este nome' 
      }, { status: 409 })
    }

    // Se este plano será o padrão, desativar outros planos padrão
    if (isDefault) {
      await prisma.subscriptionPlan.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    // Criar o novo plano
    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        maxUsers: parseInt(maxUsers),
        price: parseFloat(price),
        billingCycle: billingCycle || 'monthly',
        features: features,
        isDefault: isDefault || false
      }
    })

    // Log de auditoria para criação autorizada
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PLAN_CREATION_AUTHORIZED',
          entityId: newPlan.id,
          details: {
            createdBy: session.user.email,
            createdByRole: session.user.role,
            planName: newPlan.name,
            planId: newPlan.id,
            maxUsers: newPlan.maxUsers,
            price: newPlan.price,
            timestamp: new Date().toISOString(),
            authorized: true
          }
        }
      })
    } catch (auditError) {
      console.error('Erro ao registrar log de auditoria:', auditError)
    }

    console.log('✅ Plano criado com sucesso:', newPlan.id)
    return NextResponse.json({ 
      plan: newPlan,
      message: 'Plano criado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar plano:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
