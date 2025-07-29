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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    
    // Converter nome para maiúsculo
    if (body.name) {
      body.name = body.name.toUpperCase();
    }

    // Validar telefone (opcional)
    if (body.phone && body.phone.trim() !== '') {
      const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
      if (!phoneRegex.test(body.phone)) {
        console.log('⚠️ Telefone inválido removido:', body.phone);
        body.phone = null;
      }
    }

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: body,
      include: {
        currentContract: true,
        currentFunction: true,
        companyFunction: true
      }
    });

    console.log('✅ Funcionário atualizado:', employee.name);

    // Disparar evento de atualização das estatísticas
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/employees/stats`, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
    } catch (error) {
      console.log('⚠️ Erro ao atualizar estatísticas:', error);
    }

    return NextResponse.json(employee, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  }
}

export async function DELETE(req: NextRequest, { params }) {
  try {
    const { id } = params;
    
    // Verificar se o funcionário tem transferências associadas
    const transferRequests = await prisma.transferRequest.findMany({
      where: { employeeId: id }
    });
    
    if (transferRequests.length > 0) {
      return NextResponse.json({ 
        error: 'Não é possível deletar funcionário com transferências associadas',
        details: `Este funcionário possui ${transferRequests.length} transferência(s) associada(s). Para deletar o funcionário, primeiro remova ou transfira as solicitações de transferência.`,
        transferRequestsCount: transferRequests.length
      }, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
    }
    
    // Se não há transferências, pode deletar o funcionário
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
    
    // Verificar se é erro de constraint de chave estrangeira
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Não é possível deletar funcionário com registros associados',
        details: 'Este funcionário possui registros associados no sistema (transferências, registros de ponto, etc.). Para deletar o funcionário, primeiro remova os registros associados.',
        constraint: error.meta?.constraint || 'unknown'
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