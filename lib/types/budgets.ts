export type BudgetStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type SectionType = 'QQP' | 'CPU' | 'BDI' | 'ENCARGOS' | 'FORMULAS' | 'PROPOSTA_TECNICA' | 'PROPOSTA_COMERCIAL' | 'ORDEM_SERVICO';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Budget {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: BudgetStatus;
  version: number;
  totalValue: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  projectType?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  sections: BudgetSection[];
  formulas: BudgetFormula[];
  attachments: BudgetAttachment[];
  versions: BudgetVersion[];
  approvals: BudgetApproval[];
}

export interface BudgetSection {
  id: string;
  budgetId: string;
  name: string;
  type: SectionType;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  sectionId: string;
  code?: string;
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  formula?: string;
  parameters?: any;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormula {
  id: string;
  budgetId: string;
  name: string;
  formula: string;
  parameters?: any;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAttachment {
  id: string;
  budgetId: string;
  name: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetVersion {
  id: string;
  budgetId: string;
  version: number;
  name: string;
  description?: string;
  data: any;
  createdBy: string;
  createdAt: string;
}

export interface BudgetApproval {
  id: string;
  budgetId: string;
  level: number;
  status: ApprovalStatus;
  comments?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Composition {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: CompositionItem[];
}

export interface CompositionItem {
  id: string;
  compositionId: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetsResponse {
  budgets: Budget[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CompositionsResponse {
  compositions: Composition[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para formulários
export interface CreateBudgetData {
  name: string;
  code: string;
  description?: string;
  clientName?: string;
  projectType?: string;
  startDate?: string;
  endDate?: string;
  sections?: CreateBudgetSectionData[];
}

export interface CreateBudgetSectionData {
  name: string;
  type: SectionType;
  items?: CreateBudgetItemData[];
}

export interface CreateBudgetItemData {
  code?: string;
  description: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  formula?: string;
  parameters?: any;
}

export interface CreateCompositionData {
  name: string;
  code: string;
  description?: string;
  unit: string;
  category?: string;
  items?: CreateCompositionItemData[];
}

export interface CreateCompositionItemData {
  description: string;
  unit: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
} 