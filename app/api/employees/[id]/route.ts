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
    'currentContractId', 'currentFunctionId', 'avatar',
    // Novos campos adicionados
    'centroCusto', 'obra', 'primeiraExperiencia', 'segundaExperiencia', 
    'previsaoObra', 'mo', 'horasNormaisTrabalhadas', 'horasExtrasTrabalhadas', 
    'horasNoturnasTrabalhadas', 'localAlojado', 'pontoReferencia', 'statusBancodoc', 'efetivoRDO'
  ];
  
  const filteredUpdates: any = {};
  validFields.forEach(field => {
    if (updates.hasOwnProperty(field)) {
      filteredUpdates[field] = updates[field];
    }
  });
  
  // Tratar campos de data
  ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'].forEach(field => {
    if (filteredUpdates[field] !== undefined) {
      if (!filteredUpdates[field] || filteredUpdates[field] === '') {
        filteredUpdates[field] = null;
      }
    }
  });
  
  // Tratar campos numéricos
  ['horasNormaisTrabalhadas', 'horasExtrasTrabalhadas', 'horasNoturnasTrabalhadas'].forEach(field => {
    if (filteredUpdates[field] !== undefined) {
      if (filteredUpdates[field] === null || filteredUpdates[field] === '') {
        filteredUpdates[field] = null;
      } else {
        const value = parseFloat(filteredUpdates[field]);
        if (!isNaN(value) && value >= 0) {
          filteredUpdates[field] = value;
        } else {
          filteredUpdates[field] = null;
        }
      }
    }
  });
  
  // Tratar campo booleano
  if (filteredUpdates.efetivoRDO !== undefined) {
    if (filteredUpdates.efetivoRDO === null || filteredUpdates.efetivoRDO === '') {
      filteredUpdates.efetivoRDO = null;
    } else {
      filteredUpdates.efetivoRDO = Boolean(filteredUpdates.efetivoRDO);
    }
  }
  
  const employee = await prisma.employee.update({ where: { id }, data: filteredUpdates });
  return NextResponse.json(employee);
}

export async function DELETE(req: NextRequest, { params }) {
  const { id } = params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 