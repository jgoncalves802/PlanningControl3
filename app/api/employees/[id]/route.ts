import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }) {
  const { id } = params;
  const employee = await prisma.employee.findUnique({ where: { id } });
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(employee);
}

export async function PUT(req: NextRequest, { params }) {
  const { id } = params;
  const updates = await req.json();
  const employee = await prisma.employee.update({ where: { id }, data: updates });
  return NextResponse.json(employee);
}

export async function DELETE(req: NextRequest, { params }) {
  const { id } = params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 