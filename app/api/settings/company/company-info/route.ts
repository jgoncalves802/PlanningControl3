import { NextRequest, NextResponse } from 'next/server';

// Dados mockados para informações da empresa (em produção, isso viria do banco)
let mockCompanyInfo = {
  id: 'emp1',
  name: 'Empresa Demo Ltda',
  cnpj: '12.345.678/0001-90',
  email: 'contato@empresademo.com',
  phone: '(11) 99999-9999',
  address: 'Rua das Flores, 123 - São Paulo/SP',
  website: 'https://empresademo.com',
  logo: '/logo-default.png',
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  customDomain: 'app.empresademo.com',
  isActive: true,
  plan: 'PRO' as const,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-07-28T15:30:00Z'
};

// GET /api/settings/company/company-info - Buscar informações da empresa
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockCompanyInfo);
  } catch (error: any) {
    console.error('Erro ao buscar informações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/settings/company/company-info - Atualizar informações da empresa
export async function PUT(request: NextRequest) {
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

    // Atualizar informações da empresa
    mockCompanyInfo = {
      ...mockCompanyInfo,
      ...data,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockCompanyInfo);
  } catch (error: any) {
    console.error('Erro ao atualizar informações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 
