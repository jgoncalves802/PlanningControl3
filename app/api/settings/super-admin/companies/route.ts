import { NextRequest, NextResponse } from 'next/server';

// Dados mockados para empresas (em produção, isso viria do banco)
const mockCompanies = [
  {
    id: 'emp1',
    name: 'Empresa 1 Ltda',
    cnpj: '12.345.678/0001-90',
    email: 'contato@empresa1.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    plan: 'BASIC' as const,
    status: 'ACTIVE' as const,
    userCount: 5,
    contractCount: 3,
    createdAt: '2025-01-15T10:00:00Z',
    lastActivity: '2025-07-28T15:30:00Z'
  },
  {
    id: 'emp2',
    name: 'Empresa 2 Ltda',
    cnpj: '98.765.432/0001-10',
    email: 'contato@empresa2.com',
    phone: '(21) 88888-8888',
    address: 'Av. Principal, 456 - Rio de Janeiro/RJ',
    plan: 'PRO' as const,
    status: 'ACTIVE' as const,
    userCount: 12,
    contractCount: 8,
    createdAt: '2025-02-20T14:00:00Z',
    lastActivity: '2025-07-28T16:45:00Z'
  },
  {
    id: 'emp3',
    name: 'Empresa 3 Ltda',
    cnpj: '55.444.333/0001-22',
    email: 'contato@empresa3.com',
    phone: '(31) 77777-7777',
    address: 'Rua do Comércio, 789 - Belo Horizonte/MG',
    plan: 'ENTERPRISE' as const,
    status: 'ACTIVE' as const,
    userCount: 25,
    contractCount: 15,
    createdAt: '2025-03-10T09:00:00Z',
    lastActivity: '2025-07-28T17:20:00Z'
  }
];

// GET /api/settings/super-admin/companies - Listar todas as empresas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const skip = (page - 1) * limit;

    // Filtrar empresas
    let filteredCompanies = [...mockCompanies];
    
    if (search) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.name.toLowerCase().includes(search.toLowerCase()) ||
        company.cnpj.includes(search) ||
        company.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredCompanies = filteredCompanies.filter(company => company.status === status);
    }

    if (plan) {
      filteredCompanies = filteredCompanies.filter(company => company.plan === plan);
    }

    const total = filteredCompanies.length;
    const companies = filteredCompanies.slice(skip, skip + limit);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/settings/super-admin/companies - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'cnpj', 'email'];
    const errors: Record<string, string> = {};
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors[field] = 'Campo obrigatório';
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se o CNPJ já existe
    const existingCompany = mockCompanies.find(company => company.cnpj === data.cnpj);
    if (existingCompany) {
      return NextResponse.json(
        { error: 'CNPJ já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se o email já existe
    const existingEmail = mockCompanies.find(company => company.email === data.email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Criar nova empresa
    const newCompany = {
      id: `emp${Date.now()}`,
      name: data.name,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      plan: data.plan || 'BASIC',
      status: 'ACTIVE' as const,
      userCount: 0,
      contractCount: 0,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    // Adicionar à lista mockada (em produção, seria salvo no banco)
    mockCompanies.push(newCompany);

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 