import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Desabilitar cache para esta rota
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 API: Iniciando busca de estatísticas...');
    
    // Obter estatísticas do banco de dados
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      recentHires
    ] = await Promise.all([
      // Total de funcionários
      prisma.employee.count(),
      
      // Funcionários ativos (status ACTIVE)
      prisma.employee.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // Funcionários em licença (status ON_LEAVE)
      prisma.employee.count({
        where: {
          status: 'ON_LEAVE'
        }
      }),
      
      // Contratações recentes (últimos 30 dias)
      prisma.employee.count({
        where: {
          admissionDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
          }
        }
      })
    ]);

    const stats = {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      recentHires
    };

    console.log('📊 API: Estatísticas calculadas:', stats);

    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ API: Erro ao obter estatísticas de funcionários:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
} 