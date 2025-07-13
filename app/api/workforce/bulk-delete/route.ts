import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getUserPermissions } from '@/lib/auth';
import { AuditAction, AuditEntity, createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const permissions = getUserPermissions(user);
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Nenhum id fornecido' }, { status: 400 });
    }

    // Buscar registros para validação de permissão
    const entries = await prisma.workforceEntry.findMany({
      where: { id: { in: ids } },
      select: { id: true, contractId: true, employeeId: true }
    });
    if (entries.length !== ids.length) {
      return NextResponse.json({ error: 'Um ou mais registros não encontrados' }, { status: 404 });
    }
    // Verificar permissão para cada contrato
    for (const entry of entries) {
      if (!permissions.canViewAllContracts && !permissions.allowedContracts.includes(entry.contractId)) {
        return NextResponse.json({ error: 'Sem permissão para excluir um ou mais registros' }, { status: 403 });
      }
    }
    // Excluir registros
    await prisma.workforceEntry.deleteMany({ where: { id: { in: ids } } });
    // Registrar auditoria
    for (const entry of entries) {
      await createAuditLog({
        userId: user.id,
        entityId: entry.id,
        action: AuditAction.DELETE,
        details: { contractId: entry.contractId, employeeId: entry.employeeId, entity: AuditEntity.WORKFORCE_ENTRY }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[BULK DELETE]', error);
    return NextResponse.json({ error: 'Erro ao excluir registros' }, { status: 500 });
  }
} 