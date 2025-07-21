import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emitEmployeeEvent } from '../events/route';

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
    
    console.log('=== DEBUG PUT EMPLOYEE ===');
    console.log('ID:', id);
    console.log('Content-Type:', req.headers.get('content-type'));
    
    // Verificar se há conteúdo no body
    const body = await req.text();
    console.log('Body length:', body.length);
    
    if (!body || body.trim() === '') {
      console.log('Body está vazio');
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
      console.log('JSON parsed successfully');
      console.log('Parsed data keys:', Object.keys(rawUpdates));
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
      console.log('rawUpdates não é um objeto válido:', typeof rawUpdates);
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
        } else if (typeof filteredUpdates[field] === 'string') {
          try {
            filteredUpdates[field] = new Date(filteredUpdates[field]);
          } catch (e) {
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
    
    // Tratar campo isActive
    if (filteredUpdates.isActive !== undefined) {
      filteredUpdates.isActive = Boolean(filteredUpdates.isActive);
    }
    
    // Validação especial para avatar
    if (filteredUpdates.avatar) {
      // Verificar se é uma string base64 válida
      if (typeof filteredUpdates.avatar === 'string') {
        // Limitar o tamanho do avatar (máximo 2MB em base64)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (filteredUpdates.avatar.length > maxSize) {
          console.log('Avatar muito grande, removendo dos dados de atualização');
          delete filteredUpdates.avatar;
        } else {
          // Verificar se é um base64 válido
          const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
          if (!base64Regex.test(filteredUpdates.avatar)) {
            console.log('Avatar não é um base64 válido, removendo dos dados de atualização');
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
        console.log('Campos motherName e fatherName são idênticos, corrigindo...');
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
    
    console.log('Atualizando funcionário:', id);
    console.log('Dados filtrados:', JSON.stringify({...filteredUpdates, avatar: filteredUpdates.avatar ? '[AVATAR_DATA]' : undefined}, null, 2));
    console.log('Avatar presente nos dados filtrados:', !!filteredUpdates.avatar);
    
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
    emitEmployeeEvent('updated', updatedEmployee);
    console.log('Funcionário atualizado com sucesso');
    console.log('Dados finais no banco:', JSON.stringify(updatedEmployee, null, 2));
    
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
    emitEmployeeEvent('deleted', deletedEmployee);
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