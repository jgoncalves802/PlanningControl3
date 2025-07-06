import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }) {
  const { id } = params;
  const admission = await req.json();
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updatedHistory = Array.isArray(employee.employmentHistory)
    ? [...employee.employmentHistory, {
        contractId: admission.contractId,
        contractName: admission.contractName,
        admissionDate: new Date(admission.admissionDate),
      }]
    : [{
        contractId: admission.contractId,
        contractName: admission.contractName,
        admissionDate: new Date(admission.admissionDate),
      }];
  const updated = await prisma.employee.update({
    where: { id },
    data: {
      employmentHistory: updatedHistory,
      currentContractId: admission.contractId,
      currentContract: admission.contractName,
      admissionDate: new Date(admission.admissionDate),
      dismissalDate: undefined,
      status: 'active',
      isActive: true,
    },
  });
  return NextResponse.json(updated);
} 