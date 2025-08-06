import { NextRequest, NextResponse } from 'next/server';

// Dados mockados para usuários da empresa (em produção, isso viria do banco)
let mockCompanyUsers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@empresa.com',
    role: 'ADMIN',
    department: 'Administração',
    position: 'Gerente Administrativo',
    isActive: true,
    lastLogin: '2025-07-28T15:30:00Z',
    createdAt: '2025-01-15T10:00:00Z',
    avatar: ''
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    role: 'MANAGER',
    department: 'Recursos Humanos',
    position: 'Coordenadora de RH',
    isActive: true,
    lastLogin: '2025-07-28T14:20:00Z',
    createdAt: '2025-02-20T09:00:00Z',
    avatar: ''
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    role: 'USER',
    department: 'Operações',
    position: 'Operador',
    isActive: true,
    lastLogin: '2025-07-28T13:45:00Z',
    createdAt: '2025-03-10T11:00:00Z',
    avatar: ''
  }
];

// GET /api/settings/company/users - Listar usuários da empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const role = searchParams.get('role') || '';
    const skip = (page - 1) * limit;

    // Filtrar usuários
    let filteredUsers = [...mockCompanyUsers];

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.position.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    const total = filteredUsers.length;
    const users = filteredUsers.slice(skip, skip + limit);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar usuários da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/settings/company/users - Criar novo usuário da empresa
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validação dos campos obrigatórios
    const requiredFields = ['name', 'email', 'role', 'department', 'position'];
    const errors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!data[field]) {
        errors[field] = 'Campo obrigatório';
      }
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = mockCompanyUsers.find(user => user.email === data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      position: data.position,
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      avatar: ''
    };

    mockCompanyUsers.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar usuário da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 
