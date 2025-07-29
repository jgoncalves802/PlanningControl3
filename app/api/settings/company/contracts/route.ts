import { NextRequest, NextResponse } from 'next/server';

// Dados mockados para contratos da empresa (em produção, isso viria do banco)
let mockCompanyContracts = [
  {
    id: '1',
    name: 'Contrato Principal',
    code: 'CTR-001',
    isActive: true,
    workdayHours: 8,
    includesWeekends: false,
    includesHolidays: false,
    employeeCount: 15,
    functionCount: 8,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-07-28T15:30:00Z'
  },
  {
    id: '2',
    name: 'Contrato de Manutenção',
    code: 'CTR-002',
    isActive: true,
    workdayHours: 6,
    includesWeekends: true,
    includesHolidays: true,
    employeeCount: 8,
    functionCount: 4,
    createdAt: '2025-02-20T09:00:00Z',
    updatedAt: '2025-07-28T14:20:00Z'
  }
];

// GET /api/settings/company/contracts - Listar contratos da empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    // Filtrar contratos
    let filteredContracts = [...mockCompanyContracts];

    if (search) {
      filteredContracts = filteredContracts.filter(contract =>
        contract.name.toLowerCase().includes(search.toLowerCase()) ||
        contract.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredContracts = filteredContracts.filter(contract => 
        status === 'active' ? contract.isActive : !contract.isActive
      );
    }

    const total = filteredContracts.length;
    const contracts = filteredContracts.slice(skip, skip + limit);

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar contratos da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/settings/company/contracts - Criar novo contrato
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'code'];
    const errors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!data[field]) {
        errors[field] = 'Campo obrigatório';
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se o código já existe
    const existingContract = mockCompanyContracts.find(contract => contract.code === data.code);
    if (existingContract) {
      return NextResponse.json(
        { error: 'Código do contrato já existe' },
        { status: 409 }
      );
    }

    // Criar novo contrato
    const newContract = {
      id: Date.now().toString(),
      name: data.name,
      code: data.code,
      isActive: true,
      workdayHours: data.workdayHours || 8,
      includesWeekends: data.includesWeekends || false,
      includesHolidays: data.includesHolidays || false,
      employeeCount: 0,
      functionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockCompanyContracts.push(newContract);

    return NextResponse.json(newContract, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 