import { NextRequest, NextResponse } from 'next/server';
import { InfrastructureService, AuditService } from '@/lib/services/settingsService';
import { getServerSession } from '@/lib/auth-server';

// GET /api/settings/super-admin/infrastructure
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    const infrastructure = await InfrastructureService.getAllInfrastructure();
    
    return NextResponse.json({
      success: true,
      data: infrastructure
    });
  } catch (error) {
    console.error('Erro ao buscar infraestrutura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/settings/super-admin/infrastructure
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é super admin
    // TODO: Implementar verificação de role

    const body = await request.json();
    const { serverName, serverType, status, cpuUsage, memoryUsage, diskUsage, networkUsage, lastMaintenance, nextMaintenance, backupStatus, securityStatus } = body;

    // Validações básicas
    if (!serverName || !serverType) {
      return NextResponse.json(
        { error: 'Nome e tipo do servidor são obrigatórios' },
        { status: 400 }
      );
    }

    const infrastructure = await InfrastructureService.createInfrastructure({
      serverName,
      serverType,
      status,
      cpuUsage,
      memoryUsage,
      diskUsage,
      networkUsage,
      lastMaintenance,
      nextMaintenance,
      backupStatus,
      securityStatus
    });

    // Log de auditoria
    await AuditService.createAuditLog({
      userId: session.user.id,
      action: 'CREATE_INFRASTRUCTURE',
      entityType: 'INFRASTRUCTURE',
      entityId: infrastructure.id,
      details: { serverName, serverType, status },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      data: infrastructure,
      message: 'Infraestrutura criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar infraestrutura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 
