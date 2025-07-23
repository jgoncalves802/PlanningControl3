import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatCPF, convertExcelNumberToDate, isExcelNumber, convertNameToUpperCase } from '@/lib/csvEncodingUtils';

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
      'name', 'registration', 'company', 'rg',
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const isActive = searchParams.get('isActive');
    const include = searchParams.get('include');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { registration: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      // Apenas funcionários demitidos ou aposentados são considerados inativos
      if (status === 'DISMISSED' || status === 'RETIRED') {
        where.isActive = false;
      } else {
        // Todos os outros status (ACTIVE, ON_LEAVE, TRANSFERRED, SUSPENDED) são considerados ativos
        where.isActive = true;
        where.status = status;
      }
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Construir include baseado no parâmetro
    const includeOptions: any = {};
    
    if (include) {
      const includes = include.split(',');
      if (includes.includes('currentFunction')) {
        includeOptions.currentFunction = true;
      }
      if (includes.includes('companyFunction')) {
        includeOptions.companyFunction = true;
      }
      if (includes.includes('currentContract')) {
        includeOptions.currentContract = true;
      }
    }

    // Buscar funcionários com relacionamentos
    const employees = await prisma.employee.findMany({
      where,
      take: limit,
      skip,
      include: includeOptions
    });



    // Mapear os status para garantir que estejam corretos
    const mappedEmployees = employees.map(emp => {
      let status = emp.status;
      
      // Garantir que o status seja válido
      if (!status || !['ACTIVE', 'ON_LEAVE', 'TRANSFERRED', 'SUSPENDED', 'DISMISSED', 'RETIRED'].includes(status)) {
        status = 'ACTIVE';
      }
      

      
      return {
        ...emp,
        status
      };
    });

    // Contar total com os mesmos filtros
    const total = await prisma.employee.count({ where });

    return NextResponse.json({
      employees: mappedEmployees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
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

function parseDateBR(dateStr: string | number) {
  // Aceita DD/MM/YYYY, YYYY-MM-DD ou número do Excel
  if (!dateStr) return undefined;
  
  // Converter para string se for número
  const dateString = String(dateStr).trim();
  if (!dateString) return undefined;
  
  try {
    // Primeiro, verificar se é um número do Excel
    if (isExcelNumber(dateString)) {
      const excelDate = convertExcelNumberToDate(dateString);
      if (excelDate) {
        return excelDate.toISOString();
      }
    }
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [d, m, y] = dateString.split('/');
      const day = parseInt(d, 10);
      const month = parseInt(m, 10);
      const year = parseInt(y, 10);
      
      // Validar se os valores são válidos
      if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
        return undefined;
      }
      
      const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        return date.toISOString();
      }
    }
    
    return undefined;
  } catch (error) {
    console.warn('Erro ao processar data:', dateStr, error);
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Garantir que o request está sendo lido corretamente com UTF-8
    const rawData = await req.json();
    
    // Normalizar caracteres especiais
    const data = normalizeTextFields(rawData);

    // Converter nome para maiúsculo
    if (data.name && typeof data.name === 'string') {
      data.name = convertNameToUpperCase(data.name);
    }

    // Normalizar CPF (apenas números)
    if (data.cpf) data.cpf = formatCPF(data.cpf);

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
      'name', 'cpf'
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

    // Validação de telefone (opcional, mas se fornecido deve ser válido)
    if (data.phone && data.phone.trim() !== '') {
      const cleanPhone = data.phone.replace(/\D/g, '');
      if (!/^\d{10,11}$/.test(cleanPhone)) {
        // Em vez de erro, definir como null e continuar
        data.phone = null;
        console.log('Telefone inválido removido. Deve ser inserido posteriormente.');
      }
    } else {
      data.phone = null;
    }

    // Validação de datas (ISO)
    ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'].forEach(field => {
      if (data[field] && isNaN(Date.parse(data[field]))) {
        errors[field] = 'Data inválida';
      }
    });

    // Tamanhos máximos
    const maxLengths: Record<string, number> = {
      name: 100, registration: 20, company: 50, cpf: 14, rg: 20,
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
      'rg', 'status', 'workplace', 'shift', 'phone', 'address',
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
        else if (field === 'status') data[field] = 'ACTIVE';
        else if (field === 'address') data[field] = { cep: '' };
        else if (field === 'createdAt' || field === 'updatedAt') data[field] = new Date().toISOString();
        else data[field] = '';
      }
    });

    // Criação do funcionário
    const employee = await prisma.employee.create({ data });
    
    // Emitir evento SSE
          // emitEmployeeEvent('created', employee);

    // Disparar evento de atualização das estatísticas
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/employees/stats`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
    } catch (error) {
      console.log('⚠️ Erro ao atualizar estatísticas:', error);
    }

    // Garantir que a resposta também tenha UTF-8 correto
    return NextResponse.json(employee, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
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
