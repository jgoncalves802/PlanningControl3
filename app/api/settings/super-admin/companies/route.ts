import { NextRequest, NextResponse } from 'next/server';
import { CompanyService, AuditService } from '@/lib/services/settingsService';
import { getServerSession } from '@/lib/auth-server';

// GET /api/settings/super-admin/companies
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/settings/super-admin/companies - Iniciando busca');
    
    const session = await getServerSession();
    console.log('📋 Session:', session ? 'Encontrada' : 'Não encontrada');
    
    if (!session?.user) {
      console.log('❌ Usuário não autorizado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Usuário autorizado:', session.user.email);

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    console.log('✅ Buscando empresas...');
    const companies = await CompanyService.getAllCompanies();
    console.log('✅ Empresas encontradas:', companies.length);
    
    return NextResponse.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('💥 Erro ao buscar empresas:', error);
    console.error('💥 Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/settings/super-admin/companies
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/settings/super-admin/companies - Iniciando criação');
    
    const session = await getServerSession();
    console.log('📋 Session:', session ? 'Encontrada' : 'Não encontrada');
    
    if (!session?.user) {
      console.log('❌ Usuário não autorizado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('✅ Usuário autorizado:', session.user.email);

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    const body = await request.json();
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));
    
    const { name, cnpj, email, phone, address, logoUrl, primaryColor, secondaryColor, domain, timezone, language, subscriptionPlan, maxUsers, maxContracts, maxEmployees } = body;

    // Validações básicas
    if (!name || !cnpj || !email) {
      console.log('❌ Validação falhou - campos obrigatórios:', { name: !!name, cnpj: !!cnpj, email: !!email });
      return NextResponse.json(
        { error: 'Nome, CNPJ e email são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('✅ Validação básica passou');

    // Verificar se CNPJ já existe
    console.log('🔍 Verificando CNPJ existente...');
    const existingCnpj = await CompanyService.getCompanyByCnpj(cnpj);
    if (existingCnpj) {
      console.log('❌ CNPJ já cadastrado:', cnpj);
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    console.log('🔍 Verificando email existente...');
    const existingEmail = await CompanyService.getCompanyByEmail(email);
    if (existingEmail) {
      console.log('❌ Email já cadastrado:', email);
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    console.log('✅ Verificações de duplicação passaram');

    console.log('🏢 Criando empresa...');
    const company = await CompanyService.createCompany({
      name,
      cnpj,
      email,
      phone,
      address,
      logoUrl,
      primaryColor,
      secondaryColor,
      domain,
      timezone,
      language,
      subscriptionPlan,
      maxUsers,
      maxContracts,
      maxEmployees
    });

    console.log('✅ Empresa criada:', company.id);

    // Log de auditoria
    console.log('📝 Criando log de auditoria...');
    await AuditService.createAuditLog({
      userId: session.user.id,
      action: 'CREATE_COMPANY',
      entityType: 'COMPANY',
      entityId: company.id,
      details: { companyName: name, cnpj, email },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    console.log('✅ Log de auditoria criado');
    console.log('🎉 Empresa criada com sucesso');

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Empresa criada com sucesso'
    });
  } catch (error) {
    console.error('💥 Erro ao criar empresa:', error);
    console.error('💥 Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
} 
