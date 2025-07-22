import { prisma } from './prisma';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TIME_RECORD = 'TIME_RECORD',
}

export enum AuditEntity {
  WORKFORCE_ENTRY = 'WORKFORCE_ENTRY',
  EMPLOYEE = 'EMPLOYEE',
  CONTRACT = 'CONTRACT',
  FUNCTION = 'FUNCTION',
  // Adicione outros conforme necessário
}

interface CreateAuditLogParams {
  userId: string;
  entity: AuditEntity;
  entityId: string;
  action: AuditAction;
  details?: any;
}

export async function createAuditLog({ userId, entityId, action, details }: Omit<CreateAuditLogParams, 'entity'>) {
  return prisma.auditLog.create({
    data: {
      userId,
      entityId,
      action,
      details,
    },
  });
} 
