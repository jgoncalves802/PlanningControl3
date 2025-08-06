import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Verificando funcionários...');
    
    // Buscar todos os funcionários (sem filtro no Prisma para evitar erro de enum)
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    console.log(`📊 Encontrados ${employees.length} funcionários:`);
    employees.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });

    // Filtrar funcionários com status inválidos no JavaScript
    const invalidEmployees = employees.filter(emp => 
      emp.status === 'active' || emp.status === 'inactive'
    );

    if (invalidEmployees.length === 0) {
      console.log('✅ Nenhum funcionário com status inválido encontrado!');
      return NextResponse.json({
        success: true,
        message: 'Nenhum funcionário com status inválido encontrado',
        employees
      });
    }

    console.log(`\n🔧 Corrigindo ${invalidEmployees.length} funcionários...`);

    let activeUpdated = 0;
    let inactiveUpdated = 0;

    // Corrigir cada funcionário individualmente
    for (const emp of invalidEmployees) {
      const newStatus = emp.status === 'active' ? 'ACTIVE' : 'DISMISSED';
      
      await prisma.employee.update({
        where: { id: emp.id },
        data: { status: newStatus }
      });
      
      if (emp.status === 'active') {
        activeUpdated++;
      } else {
        inactiveUpdated++;
      }
      
      console.log(`✅ ${emp.name}: '${emp.status}' → '${newStatus}'`);
    }

    // Buscar funcionários atualizados
    const updatedEmployees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        status: true
      }
    });

    console.log('\n🎉 Correção concluída!');
    console.log('Status após correção:');
    updatedEmployees.forEach(emp => {
      console.log(`- ${emp.name}: ${emp.status}`);
    });

    return NextResponse.json({
      success: true,
      message: 'Status corrigidos com sucesso',
      activeUpdated,
      inactiveUpdated,
      employees: updatedEmployees
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 
