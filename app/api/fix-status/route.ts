import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Verificando status dos funcionários...');
    
    // Buscar todos os funcionários
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true
      }
    });

    console.log(`📊 Encontrados ${employees.length} funcionários:`);
    employees.forEach(emp => {
      console.log(`- ${emp.name}: status="${emp.status}", isActive=${emp.isActive}`);
    });

    // Atualizar funcionários com status 'active' para 'ACTIVE'
    const activeUpdate = await prisma.employee.updateMany({
      where: {
        status: 'active'
      },
      data: {
        status: 'ACTIVE'
      }
    });

    console.log(`✅ ${activeUpdate.count} funcionários atualizados de 'active' para 'ACTIVE'`);

    // Atualizar funcionários com status 'inactive' para 'DISMISSED'
    const inactiveUpdate = await prisma.employee.updateMany({
      where: {
        status: 'inactive'
      },
      data: {
        status: 'DISMISSED'
      }
    });

    console.log(`✅ ${inactiveUpdate.count} funcionários atualizados de 'inactive' para 'DISMISSED'`);

    // Verificar resultado final
    const updatedEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true
      }
    });

    console.log('\n📊 Status após correção:');
    updatedEmployees.forEach(emp => {
      console.log(`- ${emp.name}: status="${emp.status}", isActive=${emp.isActive}`);
    });

    // Adicionar alguns funcionários com diferentes status para demonstração
    console.log('\n🎨 Adicionando funcionários com diferentes status para demonstração...');

    // Verificar se já existem funcionários com diferentes status
    const existingStatuses = await prisma.employee.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log('Status existentes:', existingStatuses);

    // Se não houver funcionários com status variados, adicionar alguns
    if (existingStatuses.length <= 2) {
      // Atualizar alguns funcionários para ter status variados
      const employeesToUpdate = await prisma.employee.findMany({
        take: 5
      });

      const statuses = ['ON_LEAVE', 'TRANSFERRED', 'SUSPENDED', 'RETIRED'];
      
      for (let i = 0; i < Math.min(employeesToUpdate.length, statuses.length); i++) {
        await prisma.employee.update({
          where: { id: employeesToUpdate[i].id },
          data: { status: statuses[i] }
        });
        console.log(`✅ ${employeesToUpdate[i].name} atualizado para status: ${statuses[i]}`);
      }
    }

    console.log('\n🎉 Correção concluída com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Status dos funcionários corrigidos com sucesso',
      activeUpdated: activeUpdate.count,
      inactiveUpdated: inactiveUpdate.count,
      employees: updatedEmployees
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 
