import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { emitTransferRequestEvent } from './events/route';

// Fallback para o enum caso não esteja disponível
const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
} as const;

// GET /api/transfer-requests - Listar transferências com filtros e paginação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const toContractId = searchParams.get('toContractId');
    const requestedById = searchParams.get('requestedById');
    const approvedById = searchParams.get('approvedById');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Filtros
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (toContractId) where.toContractId = toContractId;
    if (requestedById) where.requestedById = requestedById;
    if (approvedById) where.approvedById = approvedById;
    if (search) {
      where.OR = [
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { requestedBy: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, transferRequests] = await Promise.all([
      prisma.transferRequest.count({ where }),
      prisma.transferRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          employee: { select: { id: true, name: true, registration: true, cpf: true } },
          requestedBy: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      transferRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    console.error('Erro ao buscar transferências:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}

// POST /api/transfer-requests - Criar nova solicitação de transferência
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    
    // Remover toFunctionId dos campos obrigatórios
    const requiredFields = ['employeeId', 'toContractId', 'requestedById', 'scheduledDate'];
    const errors: Record<string, string> = {};
    requiredFields.forEach(field => {
      if (!data[field]) errors[field] = 'Campo obrigatório';
    });
    if (Object.keys(errors).length > 0) {

      return NextResponse.json({ errors }, { status: 400 });
    }
    // Validação de data
    if (isNaN(Date.parse(data.scheduledDate))) {
      errors.scheduledDate = 'Data inválida';

      return NextResponse.json({ errors }, { status: 400 });
    }
    // Buscar função atual do funcionário

    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { 
        currentFunctionId: true,
        companyFunctionId: true,
        name: true,
        cpf: true 
      },
    });

    
    if (!employee) {

      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
    }
    
    // Verificar se o funcionário tem uma função atual ou se foi fornecida uma função específica
    let toFunctionId = data.toFunctionId || employee.currentFunctionId || employee.companyFunctionId;
    
    if (!toFunctionId) {

      return NextResponse.json({ 
        error: 'Funcionário não possui função atual definida',
        details: `Funcionário ${employee.name} (${employee.cpf}) não possui função atual definida. É necessário selecionar uma função para a transferência.`
      }, { status: 400 });
    }
    
    // Verificar se a função existe (pode ser ContractFunction ou CompanyFunction)
    let functionExists = await prisma.contractFunction.findUnique({
      where: { id: toFunctionId },
      select: { id: true, name: true, contractId: true },
    });
    
    // Se não encontrou como ContractFunction, tentar como CompanyFunction
    if (!functionExists) {
      const companyFunction = await prisma.companyFunction.findUnique({
        where: { id: toFunctionId },
        select: { id: true, name: true },
      });
      
      if (companyFunction) {
        // Se é uma CompanyFunction, usar o ID como toFunctionId
        functionExists = {
          id: companyFunction.id,
          name: companyFunction.name,
          contractId: null
        };
      }
    }
    
    if (!functionExists) {

      return NextResponse.json({ 
        error: 'Função não encontrada',
        details: `Função com ID ${toFunctionId} não foi encontrada no sistema.`
      }, { status: 404 });
    }
    
    // Verificar se o usuário que está fazendo a requisição existe

    
    // Se não houver requestedById, usar um usuário padrão para demonstração
    let requestingUser;
    if (!data.requestedById) {

      requestingUser = await prisma.user.findFirst({
        select: { id: true, name: true, email: true },
      });
      
      if (!requestingUser) {

        return NextResponse.json({ 
          error: 'Nenhum usuário encontrado no sistema',
          details: 'É necessário ter pelo menos um usuário cadastrado no sistema.'
        }, { status: 404 });
      }
      
      data.requestedById = requestingUser.id;
    } else {
      requestingUser = await prisma.user.findUnique({
        where: { id: data.requestedById },
        select: { id: true, name: true, email: true },
      });
      
      if (!requestingUser) {

        return NextResponse.json({ 
          error: 'Usuário que fez a requisição não encontrado',
          details: `Usuário com ID ${data.requestedById} não foi encontrado no sistema.`
        }, { status: 404 });
      }
    }
    
    // Verificar se o contrato de destino existe

    const destinationContract = await prisma.contract.findUnique({
      where: { id: data.toContractId },
      select: { id: true, name: true, code: true, isActive: true },
    });
    
    if (!destinationContract) {

      return NextResponse.json({ 
        error: 'Contrato de destino não encontrado',
        details: `Contrato com ID ${data.toContractId} não foi encontrado no sistema.`
      }, { status: 404 });
    }
    
    if (!destinationContract.isActive) {

      return NextResponse.json({ 
        error: 'Contrato de destino inativo',
        details: `Contrato ${destinationContract.name} (${destinationContract.code}) está inativo e não pode receber transferências.`
      }, { status: 400 });
    }
    
    // Criar transferência
    const transferRequest = await prisma.transferRequest.create({
      data: {
        employeeId: data.employeeId,
        toContractId: data.toContractId,
        toFunctionId: toFunctionId,
        requestedById: data.requestedById,
        scheduledDate: new Date(data.scheduledDate),
        status: 'PENDING',
      },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    });
    

    
    try {
      emitTransferRequestEvent('created', transferRequest);
    } catch (error) {
      console.error('Erro ao emitir evento de transferência:', error);
      // Não falhar a criação da transferência por causa do evento
    }
    
    return NextResponse.json(transferRequest, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
} 
