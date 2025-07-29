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

    const [transferRequests, total] = await Promise.all([
      prisma.transferRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          employee: { select: { id: true, name: true, registration: true, cpf: true, currentFunction: { select: { name: true } } } },
          requestedBy: { select: { id: true, name: true, email: true } },
          approvedBy: { select: { id: true, name: true, email: true } },
          responsibleBy: { select: { id: true, name: true, email: true } },
          finalizedBy: { select: { id: true, name: true, email: true } },
          fromContract: { select: { id: true, name: true, code: true } },
          toContract: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.transferRequest.count({ where }),
    ]);

    // Adicionar dados dos contratos às transferências (já incluídos no include)
    const transferRequestsWithDetails = transferRequests.map(transfer => ({
      ...transfer,
      fromContract: transfer.fromContract,
      toContract: transfer.toContract
    }));

    return NextResponse.json({
      transferRequests: transferRequestsWithDetails,
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

    // Campos obrigatórios
    const requiredFields = ['employeeId', 'toContractId', 'scheduledDate'];
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

    // Buscar funcionário
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { 
        currentContractId: true,
        name: true,
        cpf: true 
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário que está fazendo a requisição existe
    let requestingUser;
    let requestedById = data.requestedById;

    if (!requestedById) {
      // Se não houver requestedById, usar o primeiro usuário disponível
      requestingUser = await prisma.user.findFirst({
        select: { id: true, name: true, email: true },
        orderBy: { createdAt: 'asc' }
      });
      
      if (!requestingUser) {
        return NextResponse.json({ 
          error: 'Nenhum usuário encontrado no sistema',
          details: 'É necessário ter pelo menos um usuário cadastrado no sistema.'
        }, { status: 404 });
      }
      
      requestedById = requestingUser.id;
    } else {
      // Verificar se o usuário especificado existe
      requestingUser = await prisma.user.findUnique({
        where: { id: requestedById },
        select: { id: true, name: true, email: true }
      });
      
      if (!requestingUser) {
        return NextResponse.json({ 
          error: 'Usuário solicitante não encontrado',
          details: `Usuário com ID ${requestedById} não foi encontrado no sistema.`
        }, { status: 404 });
      }
    }

    // Criar a transferência
    const transferRequest = await prisma.transferRequest.create({
      data: {
        employeeId: data.employeeId,
        fromContractId: employee.currentContractId || data.toContractId, // Usar contrato atual ou destino como fallback
        toContractId: data.toContractId,
        requestedById: requestedById,
        scheduledDate: new Date(data.scheduledDate),
        status: 'PENDING',
        requestedAt: new Date(),
      },
      include: {
        employee: { select: { id: true, name: true, registration: true, cpf: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        fromContract: { select: { id: true, name: true, code: true } },
        toContract: { select: { id: true, name: true, code: true } },
      }
    });

    return NextResponse.json(transferRequest, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transferência:', error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
} 
