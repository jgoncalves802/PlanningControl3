import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Temporariamente removendo autenticação para testar
    // const { userId } = await auth();
    
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Buscar estatísticas
    const [total, available, assigned, lost, damaged] = await Promise.all([
      prisma.nFCBadge.count(),
      prisma.nFCBadge.count({ where: { status: 'AVAILABLE' } }),
      prisma.nFCBadge.count({ where: { status: 'ASSIGNED' } }),
      prisma.nFCBadge.count({ where: { status: 'LOST' } }),
      prisma.nFCBadge.count({ where: { status: 'DAMAGED' } }),
    ]);

    const stats = {
      total,
      available,
      assigned,
      lost,
      damaged,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching NFC badge stats:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 