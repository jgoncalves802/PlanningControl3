import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autoCorrectEmployeeData, formatCPF, convertExcelNumberToDate, isExcelNumber, convertNameToUpperCase } from '@/lib/csvEncodingUtils';

// Função para normalizar texto (caracteres especiais)
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  return text.normalize('NFC').trim();
}

// Função para normalizar campos de texto
function normalizeTextFields(data: any): any {
  const textFields = [
    'name', 'company', 'role', 'category', 'motherName', 'fatherName', 
    'nationality', 'naturalness', 'gender', 'maritalStatus', 'educationLevel',
    'workplace', 'shift', 'notes', 'centroCusto', 'obra', 'mo', 
    'localAlojado', 'pontoReferencia', 'statusBancodoc'
  ];
  
  const normalized = { ...data };
  
  textFields.forEach(field => {
    if (normalized[field]) {
      normalized[field] = normalizeText(normalized[field]);
    }
  });
  
  return normalized;
}

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// Função para validar telefone (opcional)
function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Telefone vazio é válido (opcional)
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Função para converter data do formato DD/MM/YYYY ou número do Excel
function parseDate(dateString: string | number): Date | null {
  if (!dateString) return null;
  
  // Converter para string se for número
  const dateStr = String(dateString).trim();
  if (!dateStr) return null;
  
  try {
    // Primeiro, verificar se é um número do Excel
    if (isExcelNumber(dateStr)) {
      const excelDate = convertExcelNumberToDate(dateStr);
      if (excelDate) {
        return excelDate;
      }
    }
    
    // Tenta formato DD/MM/YYYY
    const dateParts = dateStr.split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
      const year = parseInt(dateParts[2], 10);
      
      // Validar se os valores são válidos
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        return null;
      }
      
      const date = new Date(year, month, day);
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
    
    // Tenta formato ISO
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime()) && isoDate.getFullYear() > 1900 && isoDate.getFullYear() < 2100) {
      return isoDate;
    }
    
    return null;
  } catch (error) {
    console.warn('Erro ao converter data:', dateString, error);
    return null;
  }
}

// Função de validação para dados do CSV
async function validateEmployeeFromCSV(data: any, index: number) {
  const errors: Record<string, string> = {};
  
  // Validações obrigatórias
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nome é obrigatório';
  }
  
  if (!data.registration || data.registration.trim() === '') {
    errors.registration = 'Matrícula é obrigatória';
  }
  
  if (!data.company || data.company.trim() === '') {
    errors.company = 'Empresa é obrigatória';
  }
  
  // Validação de CPF
  if (!data.cpf || data.cpf.trim() === '') {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCPF(data.cpf)) {
    errors.cpf = 'CPF inválido';
  } else {
    // Verifica se CPF já existe
    const existingCpf = await prisma.employee.findUnique({ 
      where: { cpf: data.cpf.replace(/\D/g, '') } 
    });
    if (existingCpf) {
      errors.cpf = 'CPF já cadastrado';
    }
  }
  
  // Validação de telefone (opcional)
  if (data.phone && data.phone.trim() !== '') {
    if (!validatePhone(data.phone)) {
      // Em vez de erro, remover o telefone e informar
      data.phone = null;
      console.log(`Funcionário ${index + 1} (${data.name}): Telefone inválido removido. Deve ser inserido posteriormente.`);
    }
  } else {
    data.phone = null;
  }
  
  // Validação de datas
  if (data.birthDate && !parseDate(data.birthDate)) {
    errors.birthDate = 'Data de nascimento inválida (use formato DD/MM/YYYY)';
  }
  
  if (data.admissionDate && !parseDate(data.admissionDate)) {
    errors.admissionDate = 'Data de admissão inválida (use formato DD/MM/YYYY)';
  }
  
  // Validação de matrícula única por empresa
  if (data.registration && data.company) {
    const existingRegistration = await prisma.employee.findFirst({
      where: {
        registration: data.registration.toString(),
        company: data.company,
        isActive: true,
      },
    });
    if (existingRegistration) {
      errors.registration = 'Matrícula já cadastrada para esta empresa';
    }
  }
  
  // Validação de campos com tamanho máximo
  const maxLengths: Record<string, number> = {
    name: 100,
    registration: 20,
    company: 50,
    phone: 20,
    gender: 10,
    maritalStatus: 20,
    pis: 20,
    ctps: 20,
    ctpsSeries: 10,
    ctpsUf: 2,
    motherName: 100,
    status: 20,
    centroCusto: 50,
    obra: 100,
    mo: 20,
    localAlojado: 100,
    pontoReferencia: 100,
    statusBancodoc: 50
  };
  
  Object.entries(maxLengths).forEach(([field, max]) => {
    if (data[field] && typeof data[field] === 'string' && data[field].length > max) {
      errors[field] = `Máximo de ${max} caracteres`;
    }
  });
  
  return errors;
}

// Função de conversão de dados CSV para formato do banco
function convertCSVToEmployeeData(csvData: any): any {
  const employeeData = {
    name: convertNameToUpperCase(normalizeText(csvData.name)),
    registration: csvData.registration?.toString(),
    company: normalizeText(csvData.company),
    cpf: formatCPF(csvData.cpf), // Aplicar formatação de CPF
    motherName: csvData.motherName ? normalizeText(csvData.motherName) : null,
    phone: (() => {
      if (csvData.phone && csvData.phone.trim()) {
        const cleanPhone = csvData.phone.replace(/\D/g, '');
        // Validar se tem 10 ou 11 dígitos
        if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
          return cleanPhone;
        } else {
          console.log(`Telefone inválido para ${csvData.name}: "${csvData.phone}". Será salvo sem telefone.`);
          return null;
        }
      }
      return null;
    })(),
    gender: csvData.gender && csvData.gender.trim() ? normalizeText(csvData.gender) : null,
    maritalStatus: csvData.maritalStatus && csvData.maritalStatus.trim() ? normalizeText(csvData.maritalStatus) : null,
    pis: csvData.pis && csvData.pis.trim() ? csvData.pis.replace(/\D/g, '') : null,
    ctps: csvData.ctps && csvData.ctps.trim() ? csvData.ctps.replace(/\D/g, '') : null,
    ctpsSeries: csvData.ctpsSeries && csvData.ctpsSeries.trim() ? csvData.ctpsSeries : null,
    ctpsUf: csvData.ctpsUf && csvData.ctpsUf.trim() ? csvData.ctpsUf.toUpperCase() : null,
    // Sempre definir status como ACTIVE para funcionários importados
    status: 'ACTIVE',
    isActive: true,
    
    // Campos de data
    birthDate: parseDate(csvData.birthDate),
    admissionDate: parseDate(csvData.admissionDate),
    
    // Campos adicionais
    rg: csvData.rg || null,
    workplace: csvData.workplace || null,
    shift: csvData.shift || null,
    nationality: csvData.nationality || 'Brasileira',
    naturalness: csvData.naturalness || null,
    educationLevel: csvData.educationLevel || null,
    
    // Campos específicos do projeto
    centroCusto: csvData.centroCusto && csvData.centroCusto.trim() ? normalizeText(csvData.centroCusto) : null,
    obra: csvData.obra && csvData.obra.trim() ? normalizeText(csvData.obra) : null,
    mo: csvData.mo && csvData.mo.trim() ? normalizeText(csvData.mo) : null,
    localAlojado: csvData.localAlojado && csvData.localAlojado.trim() ? normalizeText(csvData.localAlojado) : null,
    pontoReferencia: csvData.pontoReferencia && csvData.pontoReferencia.trim() ? normalizeText(csvData.pontoReferencia) : null,
    statusBancodoc: csvData.statusBancodoc && csvData.statusBancodoc.trim() ? normalizeText(csvData.statusBancodoc) : null,
    efetivoRDO: csvData.efetivoRDO === 'true' || csvData.efetivoRDO === true,
    
    // Campos numéricos
    horasNormaisTrabalhadas: csvData.horasNormaisTrabalhadas ? parseFloat(csvData.horasNormaisTrabalhadas) : null,
    horasExtrasTrabalhadas: csvData.horasExtrasTrabalhadas ? parseFloat(csvData.horasExtrasTrabalhadas) : null,
    horasNoturnasTrabalhadas: csvData.horasNoturnasTrabalhadas ? parseFloat(csvData.horasNoturnasTrabalhadas) : null,
    
    // Campos de experiência (datas) - com validação adicional
    primeiraExperiencia: parseDate(csvData.primeiraExperiencia),
    segundaExperiencia: parseDate(csvData.segundaExperiencia),
    previsaoObra: parseDate(csvData.previsaoObra),
  };

  // Validação final das datas antes de retornar
  const dateFields = ['birthDate', 'admissionDate', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra'];
  dateFields.forEach(field => {
    if (employeeData[field] && (isNaN(employeeData[field].getTime()) || employeeData[field].getFullYear() < 1900 || employeeData[field].getFullYear() > 2100)) {
      console.warn(`Data inválida para campo ${field}:`, employeeData[field]);
      employeeData[field] = null;
    }
  });

  return employeeData;
}

export async function POST(req: NextRequest) {
  try {
  const employees = await req.json();
    
  if (!Array.isArray(employees)) {
      return NextResponse.json(
        { error: 'Formato inválido: esperado array de funcionários.' }, 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }
    
  const results = [];
  const createdEmployees = [];
    const failedEmployees = [];
    
    for (const [index, csvData] of employees.entries()) {
      try {
        // Aplicar correção automática de caracteres especiais
        const { correctedData, corrections } = autoCorrectEmployeeData(csvData);
        
        // Log das correções aplicadas (para debug)
        if (corrections.length > 0) {
          console.log(`Correções aplicadas para funcionário ${index + 1}:`, corrections);
        }
        
        // Validar dados do CSV (usando dados corrigidos)
        const errors = await validateEmployeeFromCSV(correctedData, index);
        
        if (Object.keys(errors).length > 0) {
          results.push({ 
            index: index + 1, 
            name: correctedData.name || 'Nome não informado',
            registration: correctedData.registration || 'Matrícula não informada',
            status: 'error', 
            errors 
          });
          failedEmployees.push({ index: index + 1, name: correctedData.name, errors });
          continue;
        }
        
        // Converter dados para formato do banco (usando dados corrigidos)
        const employeeData = convertCSVToEmployeeData(correctedData);
        
        // Criar funcionário no banco
        const employee = await prisma.employee.create({ 
          data: employeeData 
        });
        
      createdEmployees.push(employee);
        results.push({ 
          index: index + 1, 
          name: employee.name,
          registration: employee.registration,
          status: 'success', 
          id: employee.id 
        });
        
      } catch (error: any) {
        console.error(`Erro ao processar funcionário ${index + 1}:`, error);
        results.push({ 
          index: index + 1, 
          name: csvData.name || 'Nome não informado',
          registration: csvData.registration || 'Matrícula não informada',
          status: 'error', 
          errors: { 
            general: 'Erro ao inserir no banco de dados',
            details: error.message 
          } 
        });
        failedEmployees.push({ 
          index: index + 1, 
          name: csvData.name, 
          errors: { general: error.message } 
        });
      }
    }
    
    const response = {
      success: true,
      summary: {
        total: employees.length,
        created: createdEmployees.length,
        failed: failedEmployees.length
      },
      results,
      createdEmployees: createdEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        registration: emp.registration,
        cpf: emp.cpf
      })),
      failedEmployees
    };
    
    return NextResponse.json(response, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
    
  } catch (error: any) {
    console.error('Erro no endpoint de importação:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error.message 
      }, 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
} 
