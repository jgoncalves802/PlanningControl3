import { z } from 'zod';

// Schemas de validação
export const NFCBadgeCreateSchema = z.object({
  badgeId: z.string().min(1, 'ID do crachá é obrigatório'),
  notes: z.string().optional(),
});

export const NFCBadgeUpdateSchema = z.object({
  badgeId: z.string().min(1, 'ID do crachá é obrigatório').optional(),
  notes: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'LOST', 'DAMAGED']).optional(),
});

export const NFCBadgeAssignSchema = z.object({
  employeeId: z.string().min(1, 'ID do funcionário é obrigatório'),
  notes: z.string().optional(),
});

export const NFCBadgeRevokeSchema = z.object({
  notes: z.string().optional(),
});

export const NFCBadgeFilterSchema = z.object({
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'LOST', 'DAMAGED']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Tipos inferidos dos schemas
export type CreateNFCBadgeData = z.infer<typeof NFCBadgeCreateSchema>;
export type UpdateNFCBadgeData = z.infer<typeof NFCBadgeUpdateSchema>;
export type AssignNFCBadgeData = z.infer<typeof NFCBadgeAssignSchema>;
export type RevokeNFCBadgeData = z.infer<typeof NFCBadgeRevokeSchema>;
export type NFCBadgeFilterData = z.infer<typeof NFCBadgeFilterSchema>;

// Tipos de status
export type NFCBadgeStatus = 'AVAILABLE' | 'ASSIGNED' | 'LOST' | 'DAMAGED';

// Labels para os status
export const NFCBadgeStatusLabels: Record<NFCBadgeStatus, string> = {
  AVAILABLE: 'Disponível',
  ASSIGNED: 'Atribuído',
  LOST: 'Perdido',
  DAMAGED: 'Danificado',
};

// Cores para os status
export const NFCBadgeStatusColors: Record<NFCBadgeStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  LOST: 'bg-red-100 text-red-800',
  DAMAGED: 'bg-yellow-100 text-yellow-800',
};

// Ícones para os status
export const NFCBadgeStatusIcons: Record<NFCBadgeStatus, string> = {
  AVAILABLE: 'check-circle',
  ASSIGNED: 'user-check',
  LOST: 'alert-triangle',
  DAMAGED: 'alert-circle',
};

// Função para formatar o ID do crachá
export function formatNFCBadgeId(badgeId: string): string {
  if (!badgeId) return '';
  
  // Remover espaços e converter para maiúsculas
  const cleanId = badgeId.replace(/\s/g, '').toUpperCase();
  
  // Se o ID tem 8 caracteres, formatar como A1B2-C3D4
  if (cleanId.length === 8) {
    return `${cleanId.slice(0, 4)}-${cleanId.slice(4)}`;
  }
  
  // Se o ID tem 16 caracteres, formatar como A1B2-C3D4-E5F6-G7H8
  if (cleanId.length === 16) {
    return `${cleanId.slice(0, 4)}-${cleanId.slice(4, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12)}`;
  }
  
  // Para outros tamanhos, retornar como está
  return cleanId;
}

// Função para obter a cor do status
export function getNFCBadgeStatusColor(status: NFCBadgeStatus): string {
  return NFCBadgeStatusColors[status] || 'bg-gray-100 text-gray-800';
}

// Função para obter o label do status
export function getNFCBadgeStatusLabel(status: NFCBadgeStatus): string {
  return NFCBadgeStatusLabels[status] || 'Desconhecido';
}

// Função para obter o ícone do status
export function getNFCBadgeStatusIcon(status: NFCBadgeStatus): string {
  return NFCBadgeStatusIcons[status] || 'help-circle';
}

// Tipos de resposta da API
export interface NFCBadge {
  id: string;
  badgeId: string;
  status: NFCBadgeStatus;
  assignedAt: string | null;
  assignedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  employeeId: string | null;
  employee: Employee | null;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  registration: string | null;
  company: string | null;
  avatar: string | null;
}

export interface NFCBadgeStats {
  total: number;
  available: number;
  assigned: number;
  lost: number;
  damaged: number;
}

export interface NFCBadgeListResponse {
  badges: NFCBadge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para filtros
export interface NFCBadgeFilters {
  search: string;
  status: NFCBadgeStatus | 'all' | ''; // Permitir 'all' e string vazia
  assignedEmployee: string;
}

// Tipos para criação e edição
export interface CreateNFCBadgeFormData {
  badgeId: string;
  notes?: string;
}

export interface UpdateNFCBadgeFormData {
  badgeId?: string;
  notes?: string;
  status?: NFCBadgeStatus;
}

export interface AssignNFCBadgeFormData {
  employeeId: string;
  notes?: string;
}

export interface RevokeNFCBadgeFormData {
  notes?: string;
} 