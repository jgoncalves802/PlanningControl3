import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const entries = await prisma.workforceEntry.findMany({
      where: {
        OR: [
          { functionId: null },
          { functionName: null },
          { functionName: 'EMPTY' },
          { functionName: '' },
          { employeeRegistration: null },
          { employeeRegistration: '' },
        ],
      },
    });

    let count = 0;
    for (const entry of entries) {
      const employee = await prisma.employee.findUnique({
        where: { id: entry.employeeId },
        include: { companyFunction: true },
      });
      if (!employee) continue;
      const functionId = employee.companyFunctionId || null;
      const functionName = employee.companyFunction?.name || '-';
      const employeeRegistration = employee.registration || '-';
      await prisma.workforceEntry.update({
        where: { id: entry.id },
        data: {
          functionId,
          functionName,
          employeeRegistration,
        },
      });
      count++;
    }
    return NextResponse.json({ success: true, updated: count });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao corrigir registros antigos', details: error.message }, { status: 500 });
  }
} 