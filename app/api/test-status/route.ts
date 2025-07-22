import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testando busca de funcionários...');
    
    // Buscar todos os funcionários sem filtro
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

    // Contar status diferentes
    const statusCounts = employees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      total: employees.length,
      statusCounts,
      employees
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 