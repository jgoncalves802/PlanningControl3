import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }) {
  const { id } = params;
  const admission = await req.json();
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      currentContractId: admission.contractId,
      admissionDate: new Date(admission.admissionDate),
      dismissalDate: null,
      status: 'active',
      isActive: true,
    },
  });
  return NextResponse.json(updated);
} 