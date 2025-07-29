import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserServer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransferStatus } from '@prisma/client';

// Forçar renderização dinâmica
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/transfer-requests/stats - Estatísticas de transferências
export async function GET(request: NextRequest) {
  try {
    // Totais por status
    const statusCounts = await prisma.transferRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const total = await prisma.transferRequest.count();

    // Transferências nos últimos 30 dias
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentCount = await prisma.transferRequest.count({
      where: { scheduledDate: { gte: last30Days } },
    });

    // Por mês (últimos 6 meses)
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }).reverse();
    const monthly = await Promise.all(
      months.map(async ({ year, month }) => {
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 1);
        const count = await prisma.transferRequest.count({
          where: { scheduledDate: { gte: from, lt: to } },
        });
        return { year, month, count };
      })
    );

    // Por contrato
    const byContract = await prisma.transferRequest.groupBy({
      by: ['toContractId'],
      _count: { toContractId: true },
    });

    // Por contrato de origem
    const byFromContract = await prisma.transferRequest.groupBy({
      by: ['fromContractId'],
      _count: { fromContractId: true },
    });

    const stats = {
      total,
      byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s._count.status])),
      recent30Days: recentCount,
      monthly,
      byContract,
      byFromContract,
    };

    return NextResponse.json(stats, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas de transferências:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
} 
