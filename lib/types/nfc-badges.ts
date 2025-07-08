import { z } from 'zod';

// Enums
export enum NFCBadgeStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  REVOKED = 'REVOKED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  EXPIRED = 'EXPIRED'
}

// Interfaces principais
export interface NFCBadge {
  id: string;
  badgeId: string;
  employeeId: string | null;
  status: NFCBadgeStatus;
  isActive: boolean;
  assignedAt: Date | null;
  revokedAt: Date | null;
  assignedBy: string | null;
  revokedBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  employee?: {
    id: string;
    name: string;
    cpf: string;
    registration: string | null;
    company: string | null;
  } | null;
  assignedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  revokedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Schemas de validação
export const NFCBadgeCreateSchema = z.object({
  badgeId: z.string().min(1, 'ID do crachá é obrigatório').max(50, 'ID do crachá deve ter no máximo 50 caracteres'),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export const NFCBadgeUpdateSchema = z.object({
  badgeId: z.string().min(1, 'ID do crachá é obrigatório').max(50, 'ID do crachá deve ter no máximo 50 caracteres').optional(),
  status: z.nativeEnum(NFCBadgeStatus).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export const NFCBadgeAssignSchema = z.object({
  employeeId: z.string().min(1, 'ID do funcionário é obrigatório'),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

export const NFCBadgeRevokeSchema = z.object({
  reason: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
});

// Tipos derivados
export type CreateNFCBadgeData = z.infer<typeof NFCBadgeCreateSchema>;
export type UpdateNFCBadgeData = z.infer<typeof NFCBadgeUpdateSchema>;
export type AssignNFCBadgeData = z.infer<typeof NFCBadgeAssignSchema>;
export type RevokeNFCBadgeData = z.infer<typeof NFCBadgeRevokeSchema>;

// Filtros
export interface NFCBadgeFilters {
  search?: string;
  status?: NFCBadgeStatus;
  isActive?: boolean;
  employeeId?: string;
  assignedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Estatísticas
export interface NFCBadgeStats {
  total: number;
  available: number;
  assigned: number;
  revoked: number;
  lost: number;
  damaged: number;
  expired: number;
  activeEmployeesWithBadges: number;
  employeesWithoutBadges: number;
  recentlyAssigned: number; // Últimos 30 dias
  recentlyRevoked: number; // Últimos 30 dias
}

// Histórico de operações
export interface NFCBadgeOperation {
  id: string;
  badgeId: string;
  operation: 'CREATED' | 'ASSIGNED' | 'REVOKED' | 'UPDATED' | 'DELETED';
  employeeId: string | null;
  performedBy: string;
  performedAt: Date;
  details: Record<string, any>;
  notes: string | null;
}

// Resposta da API
export interface NFCBadgesResponse {
  badges: NFCBadge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utilitários
export const NFCBadgeStatusLabels: Record<NFCBadgeStatus, string> = {
  [NFCBadgeStatus.AVAILABLE]: 'Disponível',
  [NFCBadgeStatus.ASSIGNED]: 'Atribuído',
  [NFCBadgeStatus.REVOKED]: 'Revogado',
  [NFCBadgeStatus.LOST]: 'Perdido',
  [NFCBadgeStatus.DAMAGED]: 'Danificado',
  [NFCBadgeStatus.EXPIRED]: 'Expirado',
};

export const NFCBadgeStatusColors: Record<NFCBadgeStatus, string> = {
  [NFCBadgeStatus.AVAILABLE]: 'green',
  [NFCBadgeStatus.ASSIGNED]: 'blue',
  [NFCBadgeStatus.REVOKED]: 'red',
  [NFCBadgeStatus.LOST]: 'orange',
  [NFCBadgeStatus.DAMAGED]: 'yellow',
  [NFCBadgeStatus.EXPIRED]: 'gray',
};

// Validação de ID de crachá NFC
export const validateNFCBadgeId = (badgeId: string): boolean => {
  // Regex para validar formato de ID NFC comum (hexadecimal)
  const nfcIdRegex = /^[0-9A-Fa-f]{8,16}$/;
  return nfcIdRegex.test(badgeId);
};

// Formatação de ID de crachá
export const formatNFCBadgeId = (badgeId: string): string => {
  // Formatar ID em grupos de 2 caracteres separados por ':'
  return badgeId.replace(/(.{2})/g, '$1:').slice(0, -1).toUpperCase();
};

// Validação de disponibilidade
export const canAssignBadge = (badge: NFCBadge): boolean => {
  return badge.status === NFCBadgeStatus.AVAILABLE && badge.isActive;
};

export const canRevokeBadge = (badge: NFCBadge): boolean => {
  return badge.status === NFCBadgeStatus.ASSIGNED && badge.isActive;
}; 