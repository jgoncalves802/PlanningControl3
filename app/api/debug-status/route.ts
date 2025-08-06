import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Buscar todos os funcionários
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      employees,
      total: employees.length,
      statuses: employees.map(emp => emp.status)
    });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Atualizando status dos funcionários...');
    
    // Primeiro, buscar todos os funcionários (sem filtro no Prisma para evitar erro de enum)
    const allEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    // Filtrar funcionários com status inválidos no JavaScript
    const employeesToUpdate = allEmployees.filter(emp => 
      emp.status === 'active' || emp.status === 'inactive'
    );

    if (employeesToUpdate.length === 0) {
      console.log('Nenhum funcionário com status inválido encontrado.');
      return NextResponse.json({
        success: true,
        message: 'Nenhum funcionário com status inválido encontrado',
        activeUpdated: 0,
        inactiveUpdated: 0,
        employees: await prisma.employee.findMany({
          select: { name: true, status: true }
        })
      });
    }

    console.log(`Encontrados ${employeesToUpdate.length} funcionários para atualizar:`);
    employeesToUpdate.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });

    let activeUpdated = 0;
    let inactiveUpdated = 0;

    // Atualizar cada funcionário individualmente
    for (const employee of employeesToUpdate) {
      if (employee.status === 'active') {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { status: 'ACTIVE' }
        });
        activeUpdated++;
        console.log(`✅ ${employee.name}: 'active' → 'ACTIVE'`);
      } else if (employee.status === 'inactive') {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { status: 'DISMISSED' }
        });
        inactiveUpdated++;
        console.log(`✅ ${employee.name}: 'inactive' → 'DISMISSED'`);
      }
    }
    
    // Verificar resultado final
    const updatedEmployees = await prisma.employee.findMany({
      select: { name: true, status: true }
    });

    console.log('\nStatus após atualização:');
    updatedEmployees.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });

    // Adicionar alguns funcionários com status variados para demonstração
    console.log('\n🎨 Adicionando funcionários com diferentes status para demonstração...');
    
    const employeesForDemo = await prisma.employee.findMany({
      select: { id: true, name: true, status: true }
    });

    // Verificar se há funcionários com status variados
    const statusCounts = employeesForDemo.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});

    console.log('Distribuição atual de status:', statusCounts);

    // Se não houver funcionários com status variados, atualizar alguns
    if (Object.keys(statusCounts).length <= 2) {
      const statuses = ['ON_LEAVE', 'TRANSFERRED', 'SUSPENDED', 'RETIRED'];
      const employeesToUpdateDemo = employeesForDemo.slice(0, Math.min(4, employeesForDemo.length));
      
      for (let i = 0; i < employeesToUpdateDemo.length; i++) {
        const newStatus = statuses[i];
        await prisma.employee.update({
          where: { id: employeesToUpdateDemo[i].id },
          data: { status: newStatus }
        });
        console.log(`✅ ${employeesToUpdateDemo[i].name} atualizado para: ${newStatus}`);
      }
    }

    // Buscar funcionários atualizados
    const finalEmployees = await prisma.employee.findMany({
      select: { name: true, status: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Status atualizados com sucesso',
      activeUpdated,
      inactiveUpdated,
      employees: finalEmployees
    });

  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 
