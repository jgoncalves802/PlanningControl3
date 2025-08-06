import { NextRequest, NextResponse } from 'next/server';
import { InfrastructureService, AuditService } from '@/lib/services/settingsService';
import { getServerSession } from '@/lib/auth-server';

// GET /api/settings/super-admin/infrastructure/[id]
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

    const infrastructure = await InfrastructureService.getInfrastructure(params.id);
    
    if (!infrastructure) {
      return NextResponse.json(
        { error: 'Infraestrutura não encontrada' },
        { status: 404 }
      );
    }

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

// PUT /api/settings/super-admin/infrastructure/[id]
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
    const { serverName, serverType, status, cpuUsage, memoryUsage, diskUsage, networkUsage, lastMaintenance, nextMaintenance, backupStatus, securityStatus } = body;

    // Verificar se infraestrutura existe
    const existingInfrastructure = await InfrastructureService.getInfrastructure(params.id);
    if (!existingInfrastructure) {
      return NextResponse.json(
        { error: 'Infraestrutura não encontrada' },
        { status: 404 }
      );
    }

    const updatedInfrastructure = await InfrastructureService.updateInfrastructure(params.id, {
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
      action: 'UPDATE_INFRASTRUCTURE',
      entityType: 'INFRASTRUCTURE',
      entityId: params.id,
      details: { serverName, serverType, status },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      data: updatedInfrastructure,
      message: 'Infraestrutura atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar infraestrutura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/super-admin/infrastructure/[id]
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

    // Verificar se infraestrutura existe
    const existingInfrastructure = await InfrastructureService.getInfrastructure(params.id);
    if (!existingInfrastructure) {
      return NextResponse.json(
        { error: 'Infraestrutura não encontrada' },
        { status: 404 }
      );
    }

    await InfrastructureService.deleteInfrastructure(params.id);

    // Log de auditoria
    await AuditService.createAuditLog({
      userId: session.user.id,
      action: 'DELETE_INFRASTRUCTURE',
      entityType: 'INFRASTRUCTURE',
      entityId: params.id,
      details: { serverName: existingInfrastructure.serverName, serverType: existingInfrastructure.serverType },
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    });

    return NextResponse.json({
      success: true,
      message: 'Infraestrutura deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar infraestrutura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 