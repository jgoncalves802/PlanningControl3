import { NextRequest, NextResponse } from 'next/server';
import { CompanyService, AuditService } from '@/lib/services/settingsService';
import { getServerSession } from '@/lib/auth-server';

// GET /api/settings/super-admin/companies/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    const company = await CompanyService.getCompanyById(params.id);
    
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/super-admin/companies/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    const body = await request.json();
    const { name, cnpj, email, phone, address, logoUrl, primaryColor, secondaryColor, domain, timezone, language, subscriptionPlan, maxUsers, maxContracts, maxEmployees } = body;

    // Verificar se empresa existe
    const existingCompany = await CompanyService.getCompanyById(params.id);
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se CNPJ já existe (se foi alterado)
    if (cnpj && cnpj !== existingCompany.cnpj) {
      const existingCnpj = await CompanyService.getCompanyByCnpj(cnpj);
      if (existingCnpj) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400 }
        );
      }
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== existingCompany.email) {
      const existingEmail = await CompanyService.getCompanyByEmail(email);
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        );
      }
    }

    const updatedCompany = await CompanyService.updateCompany(params.id, {
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

    // Log de auditoria
    await AuditService.createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_COMPANY',
      entityType: 'COMPANY',
      entityId: params.id,
      details: { companyName: name, cnpj, email },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      data: updatedCompany,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/super-admin/companies/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    // Verificar se empresa existe
    const existingCompany = await CompanyService.getCompanyById(params.id);
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    await CompanyService.deleteCompany(params.id);

    // Log de auditoria
    await AuditService.createAuditLog({
      userId: session.user.id,
      action: 'DELETE_COMPANY',
      entityType: 'COMPANY',
      entityId: params.id,
      details: { companyName: existingCompany.name, cnpj: existingCompany.cnpj },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      message: 'Empresa deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 