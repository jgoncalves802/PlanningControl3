import { NextRequest, NextResponse } from 'next/server';
import { CompanyService, CompanySettingsService, AuditService } from '@/lib/services/settingsService';
import { getServerSession } from '@/lib/auth-server';

// GET /api/settings/company/[companyId]
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin da empresa
    // TODO: Implementar verificação de role

    const company = await CompanyService.getCompanyById(params.companyId);
    
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    const settings = await CompanySettingsService.getCompanySettings(params.companyId);

    return NextResponse.json({
      success: true,
      data: {
        company,
        settings
      }
    });
  } catch (error) {
    console.error('Erro ao buscar configurações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/company/[companyId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin da empresa
    // TODO: Implementar verificação de role

    const body = await request.json();
    const { 
      // Dados da empresa
      name, cnpj, email, phone, address, logoUrl, primaryColor, secondaryColor, domain, timezone, language,
      // Configurações da empresa
      notificationsEnabled, emailNotifications, pushNotifications, autoBackup, backupFrequency, dataRetentionDays, apiRateLimit, maxFileSize, allowedFileTypes, securityLevel, twoFactorRequired, sessionTimeout
    } = body;

    // Verificar se empresa existe
    const existingCompany = await CompanyService.getCompanyById(params.companyId);
    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar dados da empresa
    const companyData: any = {};
    if (name !== undefined) companyData.name = name;
    if (cnpj !== undefined) companyData.cnpj = cnpj;
    if (email !== undefined) companyData.email = email;
    if (phone !== undefined) companyData.phone = phone;
    if (address !== undefined) companyData.address = address;
    if (logoUrl !== undefined) companyData.logoUrl = logoUrl;
    if (primaryColor !== undefined) companyData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) companyData.secondaryColor = secondaryColor;
    if (domain !== undefined) companyData.domain = domain;
    if (timezone !== undefined) companyData.timezone = timezone;
    if (language !== undefined) companyData.language = language;

    let updatedCompany = null;
    if (Object.keys(companyData).length > 0) {
      updatedCompany = await CompanyService.updateCompany(params.companyId, companyData);
    }

    // Atualizar configurações da empresa
    const settingsData: any = {};
    if (notificationsEnabled !== undefined) settingsData.notificationsEnabled = notificationsEnabled;
    if (emailNotifications !== undefined) settingsData.emailNotifications = emailNotifications;
    if (pushNotifications !== undefined) settingsData.pushNotifications = pushNotifications;
    if (autoBackup !== undefined) settingsData.autoBackup = autoBackup;
    if (backupFrequency !== undefined) settingsData.backupFrequency = backupFrequency;
    if (dataRetentionDays !== undefined) settingsData.dataRetentionDays = dataRetentionDays;
    if (apiRateLimit !== undefined) settingsData.apiRateLimit = apiRateLimit;
    if (maxFileSize !== undefined) settingsData.maxFileSize = maxFileSize;
    if (allowedFileTypes !== undefined) settingsData.allowedFileTypes = allowedFileTypes;
    if (securityLevel !== undefined) settingsData.securityLevel = securityLevel;
    if (twoFactorRequired !== undefined) settingsData.twoFactorRequired = twoFactorRequired;
    if (sessionTimeout !== undefined) settingsData.sessionTimeout = sessionTimeout;

    let updatedSettings = null;
    if (Object.keys(settingsData).length > 0) {
      updatedSettings = await CompanySettingsService.updateCompanySettings(params.companyId, settingsData);
    }

    // Log de auditoria
    await AuditService.createAuditLog({
      userId: session.user.id,
      companyId: params.companyId,
      action: 'UPDATE_COMPANY_SETTINGS',
      entityType: 'COMPANY_SETTINGS',
      entityId: params.companyId,
      details: { 
        companyUpdated: Object.keys(companyData).length > 0,
        settingsUpdated: Object.keys(settingsData).length > 0
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      data: {
        company: updatedCompany || existingCompany,
        settings: updatedSettings
      },
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 