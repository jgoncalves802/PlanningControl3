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
  
  // Filtrar apenas campos válidos do modelo Employee
  const validFields = [
    'name', 'registration', 'role', 'category', 'company', 'cpf', 'rg', 
    'birthDate', 'admissionDate', 'dismissalDate', 'status', 'workplace', 
    'shift', 'phone', 'address', 'nationality', 'naturalness', 'gender', 
    'maritalStatus', 'educationLevel', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf',
    'voterTitle', 'voterZone', 'voterSection', 'reservist', 'reservistCategory',
    'cnh', 'cnhCategory', 'cnhValidity', 'motherName', 'fatherName', 
    'dependents', 'notes', 'employmentHistory', 'isActive', 'nfcCardId',
    'currentContractId', 'currentFunctionId'
  ];
  
  const filteredUpdates = {};
  validFields.forEach(field => {
    if (updates.hasOwnProperty(field)) {
      filteredUpdates[field] = updates[field];
    }
  });
  
  // Tratar campos de data
  ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity'].forEach(field => {
    if (filteredUpdates[field] !== undefined) {
      if (!filteredUpdates[field] || filteredUpdates[field] === '') {
        filteredUpdates[field] = null;
      }
    }
  });
  
  const employee = await prisma.employee.update({ where: { id }, data: filteredUpdates });
  return NextResponse.json(employee);
}

export async function DELETE(req: NextRequest, { params }) {
  const { id } = params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 