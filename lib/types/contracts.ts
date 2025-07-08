import { z } from 'zod'

// Tipos baseados no Prisma Schema
export interface Contract {
  id: string
  name: string
  code: string
  isActive: boolean
  workdayHours: number
  includesWeekends: boolean
  includesHolidays: boolean
  createdAt: Date
  updatedAt: Date
  
  // Campos estendidos da aplicação
  scope?: string
  client?: string
  clientManager?: string
  supplierManager?: string
  sankhyaProject?: string
  executionDeadline?: number // em dias
  totalValue?: number
  startDate?: Date
  endDate?: Date
  contractorCompany?: string
  contractorCNPJ?: string
  contractorSystem?: string
  asoExpirationDays?: number
  
  // Relacionamentos
  functions?: ContractFunction[]
  employees?: any[]
  employeeCount?: number
  requiredTrainings?: ContractTraining[]
}

export interface ContractFunction {
  id: string
  contractId: string
  name: string
  isActive: boolean
  description?: string
  employeeCount?: number
  requiredTrainings?: string[]
}

export interface ContractTraining {
  id: string
  contractId: string
  trainingId: string
  trainingName: string
  isRequired: boolean
  isImpeditive: boolean
  addedBy: string
  addedByRole: string
  addedAt: Date
  notes?: string
}

// Schemas de validação Zod
export const CreateContractSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  code: z.string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Código deve conter apenas letras maiúsculas, números e hífens'),
  workdayHours: z.number()
    .min(1, 'Horas de trabalho deve ser maior que 0')
    .max(24, 'Horas de trabalho deve ser menor que 24'),
  includesWeekends: z.boolean().default(false),
  includesHolidays: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  // Campos opcionais
  scope: z.string().max(200, 'Escopo deve ter no máximo 200 caracteres').optional(),
  client: z.string().max(100, 'Cliente deve ter no máximo 100 caracteres').optional(),
  clientManager: z.string().max(100, 'Gestor cliente deve ter no máximo 100 caracteres').optional(),
  supplierManager: z.string().max(100, 'Gestor fornecedor deve ter no máximo 100 caracteres').optional(),
  sankhyaProject: z.string().max(50, 'Projeto Sankhya deve ter no máximo 50 caracteres').optional(),
  executionDeadline: z.number().int().min(1, 'Prazo deve ser maior que 0').optional(),
  totalValue: z.number().min(0, 'Valor deve ser positivo').optional(),
  startDate: z.string().datetime().optional().or(z.date().optional()),
  endDate: z.string().datetime().optional().or(z.date().optional()),
  contractorCompany: z.string().max(100, 'Empresa contratada deve ter no máximo 100 caracteres').optional(),
  contractorCNPJ: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, 'CNPJ inválido')
    .optional(),
  contractorSystem: z.string().max(100, 'Sistema contratada deve ter no máximo 100 caracteres').optional(),
  asoExpirationDays: z.number().int().min(1, 'Prazo ASO deve ser maior que 0').max(365, 'Prazo ASO deve ser menor que 365 dias').optional()
})

export const UpdateContractSchema = CreateContractSchema.partial()

export const ContractFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  client: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'code', 'createdAt', 'startDate', 'endDate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Tipos derivados dos schemas
export type CreateContractData = z.infer<typeof CreateContractSchema>
export type UpdateContractData = z.infer<typeof UpdateContractSchema>
export type ContractFilters = z.infer<typeof ContractFiltersSchema>

// Schema para funções de contrato
export const CreateContractFunctionSchema = z.object({
  contractId: z.string().min(1, 'ID do contrato é obrigatório'),
  name: z.string()
    .min(1, 'Nome da função é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  isActive: z.boolean().default(true)
})

export const UpdateContractFunctionSchema = CreateContractFunctionSchema.partial().omit({ contractId: true })

export type CreateContractFunctionData = z.infer<typeof CreateContractFunctionSchema>
export type UpdateContractFunctionData = z.infer<typeof UpdateContractFunctionSchema>

// Utilitários para transformação de dados
export const transformContractDates = (data: any): any => {
  const transformed = { ...data }
  
  if (transformed.startDate && typeof transformed.startDate === 'string') {
    transformed.startDate = new Date(transformed.startDate)
  }
  
  if (transformed.endDate && typeof transformed.endDate === 'string') {
    transformed.endDate = new Date(transformed.endDate)
  }
  
  return transformed
}

export const sanitizeContractData = (data: any): any => {
  const sanitized = { ...data }
  
  // Normalizar CNPJ
  if (sanitized.contractorCNPJ) {
    sanitized.contractorCNPJ = sanitized.contractorCNPJ.replace(/\D/g, '')
    if (sanitized.contractorCNPJ.length === 14) {
      sanitized.contractorCNPJ = sanitized.contractorCNPJ.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      )
    }
  }
  
  // Normalizar código para maiúsculas
  if (sanitized.code) {
    sanitized.code = sanitized.code.toUpperCase()
  }
  
  return sanitized
} 