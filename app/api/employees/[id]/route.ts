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

export async function GET(req: NextRequest, { params }) {
  try {
    const { id } = params;
    const employee = await prisma.employee.findUnique({ 
      where: { id }
      // Remover include de companyFunction que não existe
    });
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
    
    // Verificar se há conteúdo no body
    const body = await req.text();
    
    if (!body || body.trim() === '') {
      return NextResponse.json({ 
        error: 'Body da requisição está vazio' 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    let rawUpdates;
    try {
      rawUpdates = JSON.parse(body);
      
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return NextResponse.json({ 
        error: 'JSON inválido no body da requisição',
        details: parseError.message
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    // Verificar se rawUpdates é um objeto válido
    if (!rawUpdates || typeof rawUpdates !== 'object') {

      return NextResponse.json({ 
        error: 'Dados inválidos no body da requisição' 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    // Normalizar caracteres especiais
    const updates = normalizeTextFields(rawUpdates);
    
    // Converter nome para maiúsculo se fornecido
    if (updates.name && typeof updates.name === 'string') {
      updates.name = convertNameToUpperCase(updates.name);
    }
    
    // Formatar CPF se fornecido
    if (updates.cpf) {
      updates.cpf = formatCPF(updates.cpf);
    }
    
    // Converter endereco para address se necessário
    if (updates.endereco && typeof updates.endereco === 'object') {
      updates.address = updates.endereco;
      delete updates.endereco;
    }
    
    // Filtrar apenas campos válidos do modelo Employee
    const validFields = [
      'name', 'registration', 'company', 'cpf', 'rg', 
      'birthDate', 'admissionDate', 'dismissalDate', 'status', 'workplace', 
      'shift', 'phone', 'address', 'nationality', 'naturalness', 'gender', 
      'maritalStatus', 'educationLevel', 'pis', 'ctps', 'ctpsSeries', 'ctpsUf',
      'voterTitle', 'voterZone', 'voterSection', 'reservist', 'reservistCategory',
      'cnh', 'cnhCategory', 'cnhValidity', 'motherName', 'fatherName', 
      'dependents', 'notes', 'employmentHistory', 'isActive', 'nfcCardId',
      'avatar', 'email', 'sexo', 'estadoCivil', 'companyFunctionId',
      // Campos de vinculação de contratos
      'contractId', 'contractAssignmentDate', 'currentContractId', 'currentFunctionId',
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
    
    // Remover campos problemáticos que podem causar erro de chave estrangeira
    delete filteredUpdates.currentContract;
    delete filteredUpdates.currentFunction;
    delete filteredUpdates.contrato;
    delete filteredUpdates.cargo;
    delete filteredUpdates.turno;
    delete filteredUpdates.dataEntrada;
    delete filteredUpdates.dataNascimento;
    
    // Tratar campos de data
    ['birthDate', 'admissionDate', 'dismissalDate', 'cnhValidity', 'primeiraExperiencia', 'segundaExperiencia', 'previsaoObra', 'contractAssignmentDate'].forEach(field => {
      if (filteredUpdates[field] !== undefined) {
        if (!filteredUpdates[field] || filteredUpdates[field] === '') {
          filteredUpdates[field] = null;
        } else if (typeof filteredUpdates[field] === 'string' || typeof filteredUpdates[field] === 'number') {
          try {
            // Primeiro, verificar se é um número do Excel
            if (isExcelNumber(filteredUpdates[field])) {
              const excelDate = convertExcelNumberToDate(filteredUpdates[field]);
              if (excelDate) {
                filteredUpdates[field] = excelDate;
                return;
              }
            }
            
            // Se não é número do Excel, tentar como data normal
            const date = new Date(filteredUpdates[field]);
            // Validar se a data é válida e está em um intervalo razoável
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
              filteredUpdates[field] = date;
            } else {
              filteredUpdates[field] = null;
            }
          } catch (e) {
            filteredUpdates[field] = null;
          }
        } else if (filteredUpdates[field] instanceof Date) {
          // Se já é um objeto Date, validar se é válido
          if (isNaN(filteredUpdates[field].getTime()) || filteredUpdates[field].getFullYear() < 1900 || filteredUpdates[field].getFullYear() > 2100) {
            filteredUpdates[field] = null;
          }
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
    
    // Validação de telefone (opcional, mas se fornecido deve ser válido)
    if (filteredUpdates.phone !== undefined) {
      if (!filteredUpdates.phone || filteredUpdates.phone === '') {
        filteredUpdates.phone = null;
      } else {
        const cleanPhone = String(filteredUpdates.phone).replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(cleanPhone)) {
          console.log('Telefone inválido removido. Deve ser inserido posteriormente.');
          filteredUpdates.phone = null;
        } else {
          filteredUpdates.phone = cleanPhone;
        }
      }
    }
    
    // Tratar campo isActive baseado no status
    if (filteredUpdates.status !== undefined) {
      // Apenas funcionários demitidos ou aposentados são considerados inativos
      if (filteredUpdates.status === 'DISMISSED' || filteredUpdates.status === 'RETIRED') {
        filteredUpdates.isActive = false;
      } else {
        // Todos os outros status (ACTIVE, ON_LEAVE, TRANSFERRED, SUSPENDED) são considerados ativos
        filteredUpdates.isActive = true;
      }
    } else if (filteredUpdates.isActive !== undefined) {
      // Se não há status mas há isActive, manter a lógica original
      filteredUpdates.isActive = Boolean(filteredUpdates.isActive);
    }
    
    // Validação especial para avatar
    if (filteredUpdates.avatar) {
      // Verificar se é uma string base64 válida
      if (typeof filteredUpdates.avatar === 'string') {
        // Limitar o tamanho do avatar (máximo 2MB em base64)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (filteredUpdates.avatar.length > maxSize) {
  
          delete filteredUpdates.avatar;
        } else {
          // Verificar se é um base64 válido
          const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
          if (!base64Regex.test(filteredUpdates.avatar)) {
            
            delete filteredUpdates.avatar;
          }
        }
      } else {
        delete filteredUpdates.avatar;
      }
    }
    
    // Validação para campos duplicados ou inconsistentes
    if (filteredUpdates.motherName && filteredUpdates.fatherName) {
      if (filteredUpdates.motherName === filteredUpdates.fatherName) {

        // Se são iguais, provavelmente há um erro nos dados
        // Vamos manter apenas o motherName e limpar o fatherName
        delete filteredUpdates.fatherName;
      }
    }
    
    // Validação para campos de gênero duplicados
    if (filteredUpdates.gender && filteredUpdates.sexo) {
      // Manter apenas o campo 'gender' que é o padrão
      delete filteredUpdates.sexo;
    }
    
    // Validação para campos de estado civil duplicados
    if (filteredUpdates.maritalStatus && filteredUpdates.estadoCivil) {
      // Manter apenas o campo 'maritalStatus' que é o padrão
      delete filteredUpdates.estadoCivil;
    }
    
    
    
    // Verificar se o funcionário existe antes de tentar atualizar
    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      return NextResponse.json({ 
        error: 'Funcionário não encontrado' 
      }, { 
        status: 404,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    const updatedEmployee = await prisma.employee.update({ 
      where: { id }, 
      data: filteredUpdates 
    });
    
    // Emitir evento SSE
    // emitEmployeeEvent('updated', updatedEmployee);
    
    
    return NextResponse.json(updatedEmployee, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    
    // Verificar se é erro de chave estrangeira
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Erro de referência: Verifique se os dados relacionados existem',
        details: error.message 
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
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
  const deletedEmployee = await prisma.employee.delete({ where: { id } });
    // Emitir evento SSE
    // emitEmployeeEvent('deleted', deletedEmployee);
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