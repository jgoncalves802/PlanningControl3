import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const contracts = await prisma.contract.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(contracts, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Criar contratos padrão se não existirem
    const defaultContracts = [
      {
        id: 'CONTRATO-001',
        name: 'Contrato 001 - Construção Civil',
        code: 'CONTRATO-001',
        isActive: true,
        workdayHours: 8,
        includesWeekends: false,
        includesHolidays: false,
      },
      {
        id: 'CONTRATO-002', 
        name: 'Contrato 002 - Manutenção',
        code: 'CONTRATO-002',
        isActive: true,
        workdayHours: 8,
        includesWeekends: true,
        includesHolidays: false,
      },
      {
        id: 'CONTRATO-003',
        name: 'Contrato 003 - Serviços Gerais',
        code: 'CONTRATO-003', 
        isActive: true,
        workdayHours: 8,
        includesWeekends: false,
        includesHolidays: true,
      }
    ];

    const createdContracts = [];
    
    for (const contract of defaultContracts) {
      const existing = await prisma.contract.findUnique({
        where: { id: contract.id }
      });
      
      if (!existing) {
        const created = await prisma.contract.create({
          data: contract
        });
        createdContracts.push(created);
      }
    }
    
    return NextResponse.json({ 
      message: 'Contratos criados com sucesso',
      created: createdContracts
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao criar contratos:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
} 