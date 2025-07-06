import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const employees = await prisma.employee.findMany();
  return NextResponse.json(employees);
}

function parseDateBR(dateStr) {
  // Aceita DD/MM/YYYY ou YYYY-MM-DD
  if (!dateStr) return undefined;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}T00:00:00Z`).toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr).toISOString();
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Normalizar CPF (apenas números)
  if (data.cpf) data.cpf = String(data.cpf).replace(/\D/g, '');

  // Normalizar e tratar datas (aceita DD/MM/YYYY ou YYYY-MM-DD)
  ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'].forEach(field => {
    if (data[field] && typeof data[field] === 'string' && data[field].trim() !== '') {
      const parsed = parseDateBR(data[field]);
      if (parsed) {
        data[field] = parsed;
      } else {
        data[field] = null;
      }
    } else {
      data[field] = null;
    }
  });

  // Garantir que naturalness exista para o Prisma
  if (!data.naturalness) data.naturalness = "";

  // Garantir que educationLevel exista para o Prisma
  if (!data.educationLevel) data.educationLevel = "";

  // Garantir que voterTitle exista para o Prisma
  if (!data.voterTitle) data.voterTitle = "";

  // Garantir que voterZone exista para o Prisma
  if (!data.voterZone) data.voterZone = "";

  // Garantir que voterSection exista para o Prisma
  if (!data.voterSection) data.voterSection = "";

  // Validações principais
  const requiredFields = [
    'name', 'cpf', 'phone'
  ];
  const errors: Record<string, string> = {};

  // Checagem de obrigatoriedade
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = 'Campo obrigatório';
    }
  });

  // Validação de CPF (formato simples)
  if (data.cpf && !/^\d{11}$/.test(data.cpf.replace(/\D/g, ''))) {
    errors.cpf = 'CPF inválido';
  }

  // Validação de datas (ISO)
  ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'].forEach(field => {
    if (data[field] && isNaN(Date.parse(data[field]))) {
      errors[field] = 'Data inválida';
    }
  });

  // Validação de telefone (simples)
  if (data.phone && !/^\d{10,11}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = 'Telefone inválido';
  }

  // Tamanhos máximos
  const maxLengths: Record<string, number> = {
    name: 100, registration: 20, role: 50, category: 30, company: 50, cpf: 14, rg: 20,
    phone: 20, nationality: 30, naturalness: 30, gender: 10, maritalStatus: 20, pis: 20,
    ctps: 20, ctpsSeries: 10, ctpsUf: 2, voterTitle: 20, voterZone: 10, voterSection: 10,
    reservist: 20, reservistCategory: 10, cnh: 20, cnhCategory: 5, motherName: 100, fatherName: 100, notes: 500,
    centroCusto: 50, obra: 100, mo: 20, localAlojado: 100, pontoReferencia: 200, statusBancodoc: 50
  };
  Object.entries(maxLengths).forEach(([field, max]) => {
    if (data[field] && typeof data[field] === 'string' && data[field].length > max) {
      errors[field] = `Máximo de ${max} caracteres`;
    }
  });

  // Validação de campos numéricos
  ['horasNormaisTrabalhadas', 'horasExtrasTrabalhadas', 'horasNoturnasTrabalhadas'].forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      const value = parseFloat(data[field]);
      if (isNaN(value) || value < 0) {
        errors[field] = 'Deve ser um número positivo';
      } else {
        data[field] = value;
      }
    } else {
      data[field] = null;
    }
  });

  // Validação de campo booleano
  if (data.efetivoRDO !== undefined && data.efetivoRDO !== null && data.efetivoRDO !== '') {
    data.efetivoRDO = Boolean(data.efetivoRDO);
  } else {
    data.efetivoRDO = null;
  }

  // Tipagem de campos complexos
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
  let registrationMatches = [];
  if (data.registration && data.company) {
    registrationMatches = await prisma.employee.findMany({
      where: {
        registration: data.registration,
        company: data.company,
        isActive: true,
      },
    });
    if (registrationMatches.length > 0) {
      errors.registration = 'Matrícula já cadastrada para esta empresa (funcionário ativo)';
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Preencher todos os campos obrigatórios do Prisma (exceto name e cpf) com valor padrão se não enviados
  const prismaRequiredFields = [
    'role', 'category', 'rg', 'status', 'workplace', 'shift', 'phone', 'address',
    'nationality', 'naturalness', 'gender', 'maritalStatus', 'educationLevel', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf',
    'voterTitle', 'voterZone', 'voterSection', 'reservist', 'reservistCategory', 'cnh', 'cnhCategory',
    'motherName', 'fatherName', 'dependents', 'isActive', 'createdAt', 'updatedAt'
  ];
  
  // Campos que podem ser únicos e devem ser tratados especialmente
  const uniqueFields = ['registration', 'company'];
  uniqueFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      data[field] = null; // Usar null em vez de string vazia para campos únicos
    }
  });
  
  // Campos opcionais que podem ser enviados como null
  const optionalFields = [
    'avatar', 'centroCusto', 'obra', 'mo', 'horasNormaisTrabalhadas', 'horasExtrasTrabalhadas', 
    'horasNoturnasTrabalhadas', 'localAlojado', 'pontoReferencia', 'statusBancodoc', 'efetivoRDO'
  ];
  optionalFields.forEach(field => {
    if (data.hasOwnProperty(field)) {
      // Manter o valor enviado (incluindo null)
    }
  });
  prismaRequiredFields.forEach(field => {
    if (typeof data[field] === 'undefined' || data[field] === null) {
      if (field === 'dependents') data[field] = [];
      else if (field === 'isActive') data[field] = true;
      else if (field === 'address') data[field] = { cep: '' };
      else if (field === 'createdAt' || field === 'updatedAt') data[field] = new Date().toISOString();
      else data[field] = '';
    }
  });

  // Criação do funcionário
  try {
    const employee = await prisma.employee.create({ data });
    return NextResponse.json(employee);
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { status: 500 });
  }
} 