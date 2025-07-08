import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NFCBadgeStatus } from '@/lib/types/nfc-badges';

// GET /api/nfc-badges/stats - Estatísticas de crachás NFC
export async function GET(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar estatísticas em paralelo
    const [
      total,
      available,
      assigned,
      revoked,
      lost,
      damaged,
      expired,
      activeEmployeesWithBadges,
      totalActiveEmployees,
      recentlyAssigned,
      recentlyRevoked,
    ] = await Promise.all([
      // Total de crachás
      prisma.nFCBadge.count(),
      
      // Crachás disponíveis
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.AVAILABLE },
      }),
      
      // Crachás atribuídos
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.ASSIGNED },
      }),
      
      // Crachás revogados
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.REVOKED },
      }),
      
      // Crachás perdidos
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.LOST },
      }),
      
      // Crachás danificados
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.DAMAGED },
      }),
      
      // Crachás expirados
      prisma.nFCBadge.count({
        where: { status: NFCBadgeStatus.EXPIRED },
      }),
      
      // Funcionários ativos com crachás
      prisma.employee.count({
        where: {
          isActive: true,
          nfcBadge: {
            status: NFCBadgeStatus.ASSIGNED,
          },
        },
      }),
      
      // Total de funcionários ativos
      prisma.employee.count({
        where: { isActive: true },
      }),
      
      // Crachás atribuídos recentemente (últimos 30 dias)
      prisma.nFCBadge.count({
        where: {
          assignedAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      
      // Crachás revogados recentemente (últimos 30 dias)
      prisma.nFCBadge.count({
        where: {
          revokedAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const employeesWithoutBadges = totalActiveEmployees - activeEmployeesWithBadges;

    const stats = {
      total,
      available,
      assigned,
      revoked,
      lost,
      damaged,
      expired,
      activeEmployeesWithBadges,
      employeesWithoutBadges,
      recentlyAssigned,
      recentlyRevoked,
    };

    return NextResponse.json(stats, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de crachás:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
} 