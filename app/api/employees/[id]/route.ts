import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para normalizar caracteres especiais e garantir UTF-8
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // Garantir que a string está em UTF-8 e normalizar
  return text
    .normalize('NFC') // Normalização canônica composta
    .trim();
}

// Função para processar todos os campos de texto de um objeto
function normalizeTextFields(data: any): any {
  const normalized = { ...data };
  
  // Campos de texto que devem ser normalizados
  const textFields = [
    'name', 'registration', 'role', 'category', 'company', 'rg',
    'workplace', 'shift', 'phone', 'nationality', 'naturalness', 
    'gender', 'maritalStatus', 'educationLevel', 'pis', 'ctps', 
    'ctpsSeries', 'ctpsUf', 'voterTitle', 'voterZone', 'voterSection',
    'reservist', 'reservistCategory', 'cnh', 'cnhCategory', 
    'motherName', 'fatherName', 'notes', 'centroCusto', 'obra',
    'mo', 'localAlojado', 'pontoReferencia', 'statusBancodoc'
  ];
  
  textFields.forEach(field => {
    if (normalized[field] && typeof normalized[field] === 'string') {
      normalized[field] = normalizeText(normalized[field]);
    }
  });
  
  // Normalizar campos do endereço se existir
  if (normalized.address && typeof normalized.address === 'object') {
    const addressFields = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep'];
    addressFields.forEach(field => {
      if (normalized.address[field] && typeof normalized.address[field] === 'string') {
        normalized.address[field] = normalizeText(normalized.address[field]);
      }
    });
  }
  
  // Normalizar campos do endereço no formato endereco se existir
  if (normalized.endereco && typeof normalized.endereco === 'object') {
    const addressFields = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep'];
    addressFields.forEach(field => {
      if (normalized.endereco[field] && typeof normalized.endereco[field] === 'string') {
        normalized.endereco[field] = normalizeText(normalized.endereco[field]);
      }
    });
  }
  
  return normalized;
}

export async function GET(req: NextRequest, { params }) {
  try {
    const { id } = params;
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(employee, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}

export async function PUT(req: NextRequest, { params }) {
  try {
    const { id } = params;
    const rawUpdates = await req.json();
    
    // Normalizar caracteres especiais
    const updates = normalizeTextFields(rawUpdates);
    
    // Filtrar apenas campos válidos do modelo Employee
    const validFields = [
      'name', 'registration', 'role', 'category', 'company', 'cpf', 'rg', 
      'birthDate', 'admissionDate', 'dismissalDate', 'status', 'workplace', 
      'shift', 'phone', 'address', 'endereco', 'nationality', 'naturalness', 'gender', 
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
    
    return NextResponse.json(employee, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}

export async function DELETE(req: NextRequest, { params }) {
  try {
    const { id } = params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
} 