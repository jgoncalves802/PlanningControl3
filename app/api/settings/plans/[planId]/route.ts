import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from '@/lib/auth-server'

const prisma = new PrismaClient()

// GET - Obter detalhes de um plano específico
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode visualizar planos
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sem permissão para visualizar planos' }, { status: 403 })
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.planId }
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ plan })

  } catch (error) {
    console.error('Erro ao obter plano:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// PUT - Atualizar plano
export async function PUT(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode atualizar planos
    if (session.user.role !== 'SUPER_ADMIN') {
      console.error(`🚨 Tentativa de atualização de plano por usuário não autorizado: ${session.user.email} (${session.user.role})`)
      
      // Log de auditoria para tentativa não autorizada
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'PLAN_UPDATE_ATTEMPT',
            entityId: params.planId,
            details: {
              attemptedBy: session.user.email,
              attemptedByRole: session.user.role,
              planId: params.planId,
              timestamp: new Date().toISOString(),
              blocked: true
            }
          }
        })
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
      
      return NextResponse.json({ error: 'Apenas Super Administradores podem atualizar planos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, maxUsers, price, billingCycle, features, isDefault, isActive } = body

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Se este plano será o padrão, desativar outros planos padrão
    if (isDefault && !existingPlan.isDefault) {
      await prisma.subscriptionPlan.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    // Atualizar o plano
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: params.planId },
      data: {
        name: name?.trim() || existingPlan.name,
        description: description?.trim() || existingPlan.description,
        maxUsers: maxUsers ? parseInt(maxUsers) : existingPlan.maxUsers,
        price: price ? parseFloat(price) : existingPlan.price,
        billingCycle: billingCycle || existingPlan.billingCycle,
        features: features || existingPlan.features,
        isDefault: isDefault !== undefined ? isDefault : existingPlan.isDefault,
        isActive: isActive !== undefined ? isActive : existingPlan.isActive,
        updatedAt: new Date()
      }
    })

    // Log de auditoria para atualização autorizada
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PLAN_UPDATE_AUTHORIZED',
          entityId: updatedPlan.id,
          details: {
            updatedBy: session.user.email,
            updatedByRole: session.user.role,
            planName: updatedPlan.name,
            planId: updatedPlan.id,
            changes: {
              name: name !== existingPlan.name,
              maxUsers: maxUsers !== existingPlan.maxUsers,
              price: price !== existingPlan.price,
              isDefault: isDefault !== existingPlan.isDefault,
              isActive: isActive !== existingPlan.isActive
            },
            timestamp: new Date().toISOString(),
            authorized: true
          }
        }
      })
    } catch (auditError) {
      console.error('Erro ao registrar log de auditoria:', auditError)
    }

    console.log('✅ Plano atualizado com sucesso:', updatedPlan.id)
    return NextResponse.json({ 
      plan: updatedPlan,
      message: 'Plano atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar plano:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// DELETE - Deletar plano
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário atual pode deletar planos
    if (session.user.role !== 'SUPER_ADMIN') {
      console.error(`🚨 Tentativa de exclusão de plano por usuário não autorizado: ${session.user.email} (${session.user.role})`)
      
      // Log de auditoria para tentativa não autorizada
      try {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'PLAN_DELETE_ATTEMPT',
            entityId: params.planId,
            details: {
              attemptedBy: session.user.email,
              attemptedByRole: session.user.role,
              planId: params.planId,
              timestamp: new Date().toISOString(),
              blocked: true
            }
          }
        })
      } catch (auditError) {
        console.error('Erro ao registrar log de auditoria:', auditError)
      }
      
      return NextResponse.json({ error: 'Apenas Super Administradores podem deletar planos' }, { status: 403 })
    }

    // Verificar se o plano existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: params.planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    // Verificar se há empresas usando este plano
    const companiesUsingPlan = await prisma.tenant.count({
      where: { subscriptionPlanId: params.planId }
    })

    if (companiesUsingPlan > 0) {
      return NextResponse.json({ 
        error: `Não é possível deletar este plano. ${companiesUsingPlan} empresa(s) estão usando este plano.`,
        companiesCount: companiesUsingPlan
      }, { status: 400 })
    }

    // Deletar o plano
    await prisma.subscriptionPlan.delete({
      where: { id: params.planId }
    })

    // Log de auditoria para exclusão autorizada
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PLAN_DELETE_AUTHORIZED',
          entityId: params.planId,
          details: {
            deletedBy: session.user.email,
            deletedByRole: session.user.role,
            planName: existingPlan.name,
            planId: params.planId,
            timestamp: new Date().toISOString(),
            authorized: true
          }
        }
      })
    } catch (auditError) {
      console.error('Erro ao registrar log de auditoria:', auditError)
    }

    console.log('✅ Plano deletado com sucesso:', params.planId)
    return NextResponse.json({ 
      message: 'Plano deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar plano:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
