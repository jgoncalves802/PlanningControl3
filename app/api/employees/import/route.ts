import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função de validação reutilizável
async function validateEmployee(data: any) {
  const requiredFields = [
    'name', 'registration', 'role', 'category', 'company', 'cpf', 'rg', 'birthDate',
    'admissionDate', 'status', 'workplace', 'shift', 'phone', 'address', 'nationality',
    'gender', 'maritalStatus', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf', 'motherName'
  ];
  const errors: Record<string, string> = {};
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'Campo obrigatório';
    }
  });
  if (data.cpf && !/^\d{11}$/.test(data.cpf.replace(/\D/g, ''))) {
    errors.cpf = 'CPF inválido';
  }
  ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity'].forEach(field => {
    if (data[field] && isNaN(Date.parse(data[field]))) {
      errors[field] = 'Data inválida';
    }
  });
  if (data.phone && !/^\d{10,11}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Telefone inválido';
  }
  const maxLengths: Record<string, number> = {
    name: 100, registration: 20, role: 50, category: 30, company: 50, cpf: 14, rg: 20,
    phone: 20, nationality: 30, naturalness: 30, gender: 10, maritalStatus: 20, pis: 20,
    ctps: 20, ctpsSeries: 10, ctpsUf: 2, voterTitle: 20, voterZone: 10, voterSection: 10,
    reservist: 20, reservistCategory: 10, cnh: 20, cnhCategory: 5, motherName: 100, fatherName: 100, notes: 500
  };
  Object.entries(maxLengths).forEach(([field, max]) => {
    if (data[field] && typeof data[field] === 'string' && data[field].length > max) {
      errors[field] = `Máximo de ${max} caracteres`;
    }
  });
  if (typeof data.address !== 'object' || !data.address.cep) {
    errors.address = 'Endereço inválido';
  }
  if (data.dependents && !Array.isArray(data.dependents)) {
    errors.dependents = 'Dependentes deve ser uma lista';
  }
  // Unicidade de CPF
  const existingCpf = await prisma.employee.findUnique({ where: { cpf: data.cpf } });
  if (existingCpf) {
    errors.cpf = 'CPF já cadastrado';
  }
  // Matrícula única por empresa (apenas se funcionário ativo)
  const registrationMatches = await prisma.employee.findMany({
    where: {
      registration: data.registration,
      company: data.company,
      isActive: true,
    },
  });
  if (registrationMatches.length > 0) {
    errors.registration = 'Matrícula já cadastrada para esta empresa (funcionário ativo)';
  }
  return errors;
}

export async function POST(req: NextRequest) {
  const employees = await req.json();
  if (!Array.isArray(employees)) {
    return NextResponse.json({ error: 'Formato inválido: esperado array de funcionários.' }, { status: 400 });
  }
  const results = [];
  const createdEmployees = [];
  for (const [index, data] of employees.entries()) {
    // Tratar campos de data antes da validação
    ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity'].forEach(field => {
      if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
        // Manter valor se for válido
        if (isNaN(Date.parse(data[field]))) {
          data[field] = null;
        }
      } else {
        data[field] = null;
      }
    });
    
    const errors = await validateEmployee(data);
    if (Object.keys(errors).length > 0) {
      results.push({ index, status: 'error', errors });
      continue;
    }
    try {
      const employee = await prisma.employee.create({ data });
      createdEmployees.push(employee);
      results.push({ index, status: 'success', id: employee.id });
    } catch (e) {
      results.push({ index, status: 'error', errors: { general: 'Erro ao inserir no banco', details: e.message } });
    }
  }
  return NextResponse.json({ results, created: createdEmployees.length });
} 