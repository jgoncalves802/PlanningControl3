import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const employees = await prisma.employee.findMany();
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const employee = await prisma.employee.create({ data });
  return NextResponse.json(employee);
} 