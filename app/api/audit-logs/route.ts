import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entityId');
  const action = searchParams.get('action');
  const employeeId = searchParams.get('employeeId');

  let where: any = {};
  if (entityId) {
    where.entityId = entityId;
  }
  if (action) where.action = action;

  // Busca por histórico de ponto do funcionário
  if (employeeId && action === 'TIME_RECORD') {
    where = {
      action: 'TIME_RECORD',
      details: {
        path: ['employeeId'],
        equals: employeeId,
      },
    };
  }

  if (!entityId && !(employeeId && action === 'TIME_RECORD')) {
    return new Response(JSON.stringify({ error: 'Parâmetro entityId ou employeeId+action=TIME_RECORD é obrigatório.' }), { status: 400 });
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });
  return new Response(JSON.stringify(logs), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
} 