// Mock data for demonstration purposes
import { addDays, subDays, addHours } from 'date-fns'
import { User, UserRole } from './auth'

export interface Contract {
  id: string
  name: string
  code: string
  isActive: boolean
  workdayHours: number
  includesWeekends: boolean
  includesHolidays: boolean
  functions: ContractFunction[]
  employeeCount: number
  createdAt: Date
  // Novos campos para transferências
  contractorCompany: string
  contractorCNPJ: string
  contractorSystem?: string // Sistema da contratada
  // Novos campos para treinamentos
  requiredTrainings: ContractTraining[]
  asoExpirationDays: number // Prazo em dias para considerar ASO vencendo (configurável por gestor)
  // Novos campos baseados na imagem
  scope?: string // Escopo
  client?: string // Cliente
  clientManager?: string // Gestor Cliente
  supplierManager?: string // Gestor Fornecedor
  sankhyaProject?: string // Projeto Sankhya
  executionDeadline?: number // Prazo Execução (em dias)
  totalValue?: number // Valor total do contrato
  startDate?: Date // Data de início
  endDate?: Date // Data de fim
}

export interface ContractFunction {
  id: string
  contractId: string
  name: string
  description: string
  isActive: boolean
  employeeCount: number
  requiredTrainings: string[] // IDs dos treinamentos obrigatórios
}

export interface ContractTraining {
  id: string
  contractId: string
  trainingId: string
  trainingName: string
  isRequired: boolean
  isImpeditive: boolean // Se impede transferência quando vencido/ausente
  addedBy: string
  addedByRole: UserRole
  addedAt: Date
  notes?: string
}

export interface EmploymentHistoryEntry {
  contractId: string
  contractName: string
  admissionDate: Date
  dismissalDate?: Date
}

export interface Address {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
}

export interface Dependent {
  nome: string
  parentesco: string
  nascimento: string // ou Date
}

export interface CompanyFunction {
  id: string
  name: string
  laborType: 'DIRETO' | 'INDIRETO'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  name: string
  registration?: string
  company?: string
  cpf: string
  rg?: string
  birthDate?: string | Date // ou Date
  admissionDate?: string | Date // ou Date
  dismissalDate?: string | Date // ou Date
  status: string
  workplace?: string
  shift?: string
  phone?: string
  address?: Address  // Opcional para compatibilidade
  endereco?: Address // Campo usado no drawer
  nationality?: string
  naturalness?: string
  gender?: string
  maritalStatus?: string
  educationLevel?: string
  pis?: string
  ctps?: string
  ctpsSeries?: string
  ctpsUf?: string
  voterTitle?: string
  voterZone?: string
  voterSection?: string
  reservist?: string
  reservistCategory?: string
  cnh?: string
  cnhCategory?: string
  cnhValidity?: string // ou Date
  motherName?: string
  fatherName?: string
  dependents?: Dependent[]
  notes?: string
  employmentHistory?: any
  isActive: boolean
  createdAt?: string | Date // ou Date
  updatedAt?: string | Date // ou Date
  nfcCardId?: string
  currentContractId?: string
  currentFunctionId?: string
  companyFunctionId?: string
  currentContract?: string | { id: string; name: string; code: string }
  currentFunction?: string | { id: string; name: string }
  companyFunction?: CompanyFunction
  avatar?: string
  email?: string
  // Novos campos adicionados
  mo?: string // Tipo de Mão de Obra
  horasNormaisTrabalhadas?: number // Horas Normais
  horasExtrasTrabalhadas?: number // Horas Extras
  horasNoturnasTrabalhadas?: number // Horas Noturnas
  localAlojado?: string // Local/Alojamento
  pontoReferencia?: string // Ponto de Referência
  statusBancodoc?: string // Status Bancário/Documental
  efetivoRDO?: boolean // Efetivo Apontado em RDO
  centroCusto?: string // Centro de Custo
  obra?: string // Obra
  primeiraExperiencia?: Date // Primeira Experiência
  segundaExperiencia?: Date // Segunda Experiência
  previsaoObra?: Date // Previsão na Obra
  // ... outros campos auxiliares se necessário ...
}

export interface TransferRequest {
  id: string
  employeeId: string
  employeeName: string
  fromContractId: string
  fromContract: string
  toContractId: string
  toContract: string
  toFunction: string
  requestedBy: string
  requestedByRole: UserRole
  approvedBy?: string
  reason?: string
  status: TransferStatus
  scheduledDate: Date
  completedAt?: Date
  createdAt: Date
  // Novos campos para o fluxo
  approvalHistory: TransferApproval[]
  currentStep: TransferStep
  contractorSystemConfirmed?: boolean
  contractorSystemName?: string
  contractorSystemConfirmedBy?: string
  contractorSystemConfirmedAt?: Date
  // Validações de segurança
  safetyValidation?: TransferSafetyValidation
}

export interface TransferSafetyValidation {
  isValid: boolean
  missingTrainings: string[]
  expiringASOs: string[]
  expiringTrainings: string[]
  validatedBy?: string
  validatedAt?: Date
  notes?: string
}

export interface TransferApproval {
  id: string
  step: TransferStep
  approvedBy: string
  approvedByRole: UserRole
  approvedAt: Date
  comments?: string
  action: 'APPROVED' | 'REJECTED'
}

export interface ASO {
  id: string
  employeeId: string
  employeeName: string
  examType: ASOType
  examDate: Date
  validUntil: Date
  result: ASOResult
  status: 'valid' | 'expiring' | 'expired'
}

export interface Training {
  id: string
  name: string
  description: string
  validityMonths: number
  isRequired: boolean
  category: 'safety' | 'technical' | 'compliance'
  createdBy?: string
  createdAt?: Date
}

export interface EmployeeTraining {
  id: string
  employeeId: string
  trainingId: string
  trainingName: string
  completedAt: Date
  validUntil: Date
  certificateUrl?: string
  status: 'valid' | 'expiring' | 'expired'
}

export enum TransferStatus {
  PENDING_DESTINATION_APPROVAL = 'PENDING_DESTINATION_APPROVAL', // Aguardando aprovação do gestor/planejador do contrato destino
  PENDING_ADMIN_APPROVAL = 'PENDING_ADMIN_APPROVAL', // Aguardando aprovação do ADM
  PENDING_CONTRACTOR_SYSTEM = 'PENDING_CONTRACTOR_SYSTEM', // Aguardando confirmação no sistema da contratada
  PENDING_CONTRACTOR_RELEASE = 'PENDING_CONTRACTOR_RELEASE', // Aguardando liberação da contratante
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  BLOCKED_SAFETY = 'BLOCKED_SAFETY' // Bloqueado por questões de segurança
}

export enum TransferStep {
  DESTINATION_APPROVAL = 'DESTINATION_APPROVAL',
  ADMIN_APPROVAL = 'ADMIN_APPROVAL', 
  CONTRACTOR_SYSTEM = 'CONTRACTOR_SYSTEM',
  CONTRACTOR_RELEASE = 'CONTRACTOR_RELEASE',
  COMPLETED = 'COMPLETED'
}

export enum ASOType {
  ADMISSIONAL = 'ADMISSIONAL',
  PERIODIC = 'PERIODIC',
  FUNCTION_CHANGE = 'FUNCTION_CHANGE',
  RETURN_TO_WORK = 'RETURN_TO_WORK',
  DISMISSAL = 'DISMISSAL'
}

export enum ASOResult {
  FIT = 'FIT',
  FIT_WITH_RESTRICTIONS = 'FIT_WITH_RESTRICTIONS',
  UNFIT = 'UNFIT'
}

// Mock data
export const mockTrainings: Training[] = [
  {
    id: '1',
    name: 'Treinamento Básico de Segurança',
    description: 'Princípios fundamentais de segurança no trabalho',
    validityMonths: 12,
    isRequired: true,
    category: 'safety',
    createdBy: 'Setor Segurança',
    createdAt: subDays(new Date(), 365)
  },
  {
    id: '2',
    name: 'Gestão Avançada de Segurança',
    description: 'Protocolos avançados de segurança para funções supervisórias',
    validityMonths: 24,
    isRequired: true,
    category: 'safety',
    createdBy: 'Setor Segurança',
    createdAt: subDays(new Date(), 300)
  },
  {
    id: '3',
    name: 'Certificação de Operação de Equipamentos',
    description: 'Certificação para operação de equipamentos pesados',
    validityMonths: 36,
    isRequired: false,
    category: 'technical',
    createdBy: 'Setor Técnico',
    createdAt: subDays(new Date(), 200)
  },
  {
    id: '4',
    name: 'Padrões de Controle de Qualidade',
    description: 'Metodologias de garantia e controle de qualidade',
    validityMonths: 18,
    isRequired: true,
    category: 'compliance',
    createdBy: 'Setor Qualidade',
    createdAt: subDays(new Date(), 180)
  },
  {
    id: '5',
    name: 'Trabalho em Altura',
    description: 'Segurança para trabalhos em altura',
    validityMonths: 12,
    isRequired: true,
    category: 'safety',
    createdBy: 'Setor Segurança',
    createdAt: subDays(new Date(), 150)
  },
  {
    id: '6',
    name: 'Espaço Confinado',
    description: 'Procedimentos de segurança para espaços confinados',
    validityMonths: 12,
    isRequired: true,
    category: 'safety',
    createdBy: 'Setor Segurança',
    createdAt: subDays(new Date(), 120)
  },
  {
    id: '7',
    name: 'Soldagem Industrial',
    description: 'Técnicas e segurança em soldagem industrial',
    validityMonths: 24,
    isRequired: true,
    category: 'technical',
    createdBy: 'Setor Técnico',
    createdAt: subDays(new Date(), 100)
  }
]

export const mockContracts: Contract[] = [
  {
    id: '1',
    name: 'Construction Project Alpha',
    code: 'CONST-001',
    isActive: true,
    workdayHours: 8,
    includesWeekends: false,
    includesHolidays: false,
    employeeCount: 45,
    createdAt: subDays(new Date(), 120),
    contractorCompany: 'Construtora ABC Ltda',
    contractorCNPJ: '12.345.678/0001-90',
    contractorSystem: 'Sistema ABC Works',
    asoExpirationDays: 15, // Configurável por gestor
    // Novos campos baseados na imagem
    scope: 'Construção de Edifício Comercial',
    client: 'Petrobras S.A.',
    clientManager: 'João Silva',
    supplierManager: 'Maria Santos',
    sankhyaProject: 'PROJ-2024-001',
    executionDeadline: 365,
    totalValue: 15000000,
    startDate: subDays(new Date(), 90),
    endDate: addDays(new Date(), 275),
    requiredTrainings: [
      {
        id: 'ct1',
        contractId: '1',
        trainingId: '1',
        trainingName: 'Treinamento Básico de Segurança',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Supervisor Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 100),
        notes: 'Obrigatório para todas as funções'
      },
      {
        id: 'ct2',
        contractId: '1',
        trainingId: '5',
        trainingName: 'Trabalho em Altura',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Supervisor Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 95),
        notes: 'Necessário para funções que envolvem trabalho em altura'
      },
      {
        id: 'ct3',
        contractId: '1',
        trainingId: '7',
        trainingName: 'Soldagem Industrial',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Supervisor Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 90),
        notes: 'Específico para soldadores'
      }
    ],
    functions: [
      {
        id: '1',
        contractId: '1',
        name: 'Site Engineer',
        description: 'Responsible for on-site engineering oversight',
        isActive: true,
        employeeCount: 5,
        requiredTrainings: ['1', '2'] // Treinamento básico + avançado
      },
      {
        id: '2',
        contractId: '1',
        name: 'Construction Worker',
        description: 'General construction and building tasks',
        isActive: true,
        employeeCount: 25,
        requiredTrainings: ['1', '5'] // Treinamento básico + trabalho em altura
      },
      {
        id: '3',
        contractId: '1',
        name: 'Safety Officer',
        description: 'Workplace safety monitoring and compliance',
        isActive: true,
        employeeCount: 3,
        requiredTrainings: ['1', '2', '5', '6'] // Todos os treinamentos de segurança
      }
    ]
  },
  {
    id: '2',
    name: 'Manufacturing Unit B',
    code: 'MFG-002',
    isActive: true,
    workdayHours: 12,
    includesWeekends: true,
    includesHolidays: false,
    employeeCount: 78,
    createdAt: subDays(new Date(), 200),
    contractorCompany: 'Indústria XYZ S.A.',
    contractorCNPJ: '98.765.432/0001-10',
    contractorSystem: 'ERP Industrial XYZ',
    asoExpirationDays: 30, // Prazo maior para contratos industriais
    // Novos campos baseados na imagem
    scope: 'Operação de Unidade Industrial',
    client: 'Vale S.A.',
    clientManager: 'Carlos Oliveira',
    supplierManager: 'Ana Costa',
    sankhyaProject: 'PROJ-2024-002',
    executionDeadline: 730,
    totalValue: 25000000,
    startDate: subDays(new Date(), 150),
    endDate: addDays(new Date(), 580),
    requiredTrainings: [
      {
        id: 'ct4',
        contractId: '2',
        trainingId: '1',
        trainingName: 'Treinamento Básico de Segurança',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Gerente Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 180),
        notes: 'Base para todas as atividades industriais'
      },
      {
        id: 'ct5',
        contractId: '2',
        trainingId: '4',
        trainingName: 'Padrões de Controle de Qualidade',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Gerente Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 175),
        notes: 'Essencial para manter qualidade dos produtos'
      },
      {
        id: 'ct6',
        contractId: '2',
        trainingId: '6',
        trainingName: 'Espaço Confinado',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Gerente Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 170),
        notes: 'Para trabalhos em tanques e equipamentos'
      }
    ],
    functions: [
      {
        id: '4',
        contractId: '2',
        name: 'Production Operator',
        description: 'Machine operation and quality control',
        isActive: true,
        employeeCount: 40,
        requiredTrainings: ['1', '4'] // Básico + qualidade
      },
      {
        id: '5',
        contractId: '2',
        name: 'Maintenance Technician',
        description: 'Equipment maintenance and repair',
        isActive: true,
        employeeCount: 15,
        requiredTrainings: ['1', '6'] // Básico + espaço confinado
      },
      {
        id: '6',
        contractId: '2',
        name: 'Quality Inspector',
        description: 'Product quality assurance and testing',
        isActive: true,
        employeeCount: 8,
        requiredTrainings: ['1', '4'] // Básico + qualidade
      }
    ]
  },
  {
    id: '3',
    name: 'Facility Services',
    code: 'FAC-003',
    isActive: true,
    workdayHours: 8,
    includesWeekends: true,
    includesHolidays: true,
    employeeCount: 32,
    createdAt: subDays(new Date(), 90),
    contractorCompany: 'Serviços Gerais 123 Ltda',
    contractorCNPJ: '11.222.333/0001-44',
    contractorSystem: 'Sistema Facility Pro',
    asoExpirationDays: 10, // Prazo menor para serviços gerais
    // Novos campos baseados na imagem
    scope: 'Serviços de Facilities',
    client: 'Empresa ABC Ltda',
    clientManager: 'Pedro Almeida',
    supplierManager: 'Lucia Ferreira',
    sankhyaProject: 'PROJ-2024-003',
    executionDeadline: 180,
    totalValue: 5000000,
    startDate: subDays(new Date(), 60),
    endDate: addDays(new Date(), 120),
    requiredTrainings: [
      {
        id: 'ct7',
        contractId: '3',
        trainingId: '1',
        trainingName: 'Treinamento Básico de Segurança',
        isRequired: true,
        isImpeditive: true,
        addedBy: 'Coordenador Segurança',
        addedByRole: UserRole.SAFETY,
        addedAt: subDays(new Date(), 80),
        notes: 'Fundamental para todos os serviços'
      }
    ],
    functions: [
      {
        id: '7',
        contractId: '3',
        name: 'Security Guard',
        description: 'Facility security and access control',
        isActive: true,
        employeeCount: 20,
        requiredTrainings: ['1'] // Apenas básico
      },
      {
        id: '8',
        contractId: '3',
        name: 'Janitor',
        description: 'Facility cleaning and maintenance',
        isActive: true,
        employeeCount: 12,
        requiredTrainings: ['1'] // Apenas básico
      }
    ]
  }
]

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Mitchell',
    cpf: '123.456.789-01',
    nfcCardId: 'NFC001',
    currentContractId: '1',
    currentFunctionId: '1',
    currentContract: 'Construction Project Alpha',
    currentFunction: 'Site Engineer',
    admissionDate: subDays(new Date(), 90),
    isActive: true,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    email: 'john.mitchell@example.com',
    phone: '+1 (555) 123-4567',
    employmentHistory: [
      {
        contractId: '1',
        contractName: 'Construction Project Alpha',
        admissionDate: subDays(new Date(), 90),
        dismissalDate: subDays(new Date(), 120)
      },
      {
        contractId: '2',
        contractName: 'Manufacturing Unit B',
        admissionDate: subDays(new Date(), 150),
        dismissalDate: subDays(new Date(), 180)
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    cpf: '234.567.890-12',
    nfcCardId: 'NFC002',
    currentContractId: '2',
    currentFunctionId: '4',
    currentContract: 'Manufacturing Unit B',
    currentFunction: 'Production Operator',
    admissionDate: subDays(new Date(), 150),
    isActive: true,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 234-5678',
    employmentHistory: [
      {
        contractId: '2',
        contractName: 'Manufacturing Unit B',
        admissionDate: subDays(new Date(), 150),
        dismissalDate: subDays(new Date(), 180)
      }
    ]
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    cpf: '345.678.901-23',
    nfcCardId: 'NFC003',
    currentContractId: '1',
    currentFunctionId: '3',
    currentContract: 'Construction Project Alpha',
    currentFunction: 'Safety Officer',
    admissionDate: subDays(new Date(), 60),
    isActive: true,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    email: 'michael.rodriguez@example.com',
    phone: '+1 (555) 345-6789',
    employmentHistory: [
      {
        contractId: '1',
        contractName: 'Construction Project Alpha',
        admissionDate: subDays(new Date(), 60),
        dismissalDate: subDays(new Date(), 90)
      }
    ]
  },
  {
    id: '4',
    name: 'Emily Chen',
    cpf: '456.789.012-34',
    nfcCardId: 'NFC004',
    currentContractId: '2',
    currentFunctionId: '6',
    currentContract: 'Manufacturing Unit B',
    currentFunction: 'Quality Inspector',
    admissionDate: subDays(new Date(), 120),
    isActive: true,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    email: 'emily.chen@example.com',
    phone: '+1 (555) 456-7890',
    employmentHistory: [
      {
        contractId: '2',
        contractName: 'Manufacturing Unit B',
        admissionDate: subDays(new Date(), 120),
        dismissalDate: subDays(new Date(), 150)
      }
    ]
  },
  {
    id: '5',
    name: 'David Williams',
    cpf: '567.890.123-45',
    nfcCardId: 'NFC005',
    currentContractId: '3',
    currentFunctionId: '7',
    currentContract: 'Facility Services',
    currentFunction: 'Security Guard',
    admissionDate: subDays(new Date(), 200),
    isActive: true,
    status: 'on_leave',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    email: 'david.williams@example.com',
    phone: '+1 (555) 567-8901'
  }
]

export const mockTransferRequests: TransferRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Mitchell',
    fromContractId: '1',
    fromContract: 'Construction Project Alpha',
    toContractId: '2',
    toContract: 'Manufacturing Unit B',
    toFunction: 'Quality Inspector',
    requestedBy: 'Gestor Contrato A',
    requestedByRole: UserRole.CONTRACT_MANAGER,
    status: TransferStatus.BLOCKED_SAFETY,
    currentStep: TransferStep.DESTINATION_APPROVAL,
    reason: 'Oportunidade de desenvolvimento de habilidades',
    scheduledDate: addDays(new Date(), 7),
    createdAt: subDays(new Date(), 2),
    approvalHistory: [],
    safetyValidation: {
      isValid: false,
      missingTrainings: ['Padrões de Controle de Qualidade', 'Espaço Confinado'],
      expiringASOs: [],
      expiringTrainings: ['Treinamento Básico de Segurança'],
      validatedBy: 'Sistema Automático',
      validatedAt: subDays(new Date(), 1),
      notes: 'Funcionário não possui treinamentos obrigatórios para o contrato de destino'
    }
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    fromContractId: '2',
    fromContract: 'Manufacturing Unit B',
    toContractId: '1',
    toContract: 'Construction Project Alpha',
    toFunction: 'Site Engineer',
    requestedBy: 'Planejador Contrato B',
    requestedByRole: UserRole.PLANNING,
    status: TransferStatus.PENDING_CONTRACTOR_SYSTEM,
    currentStep: TransferStep.CONTRACTOR_SYSTEM,
    reason: 'Necessidade do projeto',
    scheduledDate: addDays(new Date(), 14),
    createdAt: subDays(new Date(), 5),
    approvalHistory: [
      {
        id: '1',
        step: TransferStep.DESTINATION_APPROVAL,
        approvedBy: 'Gestor Contrato A',
        approvedByRole: UserRole.CONTRACT_MANAGER,
        approvedAt: subDays(new Date(), 4),
        action: 'APPROVED',
        comments: 'Aprovado - funcionário tem perfil adequado'
      },
      {
        id: '2',
        step: TransferStep.ADMIN_APPROVAL,
        approvedBy: 'Admin RH',
        approvedByRole: UserRole.HR,
        approvedAt: subDays(new Date(), 3),
        action: 'APPROVED',
        comments: 'Documentação em ordem, aprovado'
      }
    ],
    safetyValidation: {
      isValid: true,
      missingTrainings: [],
      expiringASOs: [],
      expiringTrainings: [],
      validatedBy: 'Supervisor Segurança',
      validatedAt: subDays(new Date(), 4),
      notes: 'Todos os requisitos de segurança atendidos'
    }
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Michael Rodriguez',
    fromContractId: '1',
    fromContract: 'Construction Project Alpha',
    toContractId: '3',
    toContract: 'Facility Services',
    toFunction: 'Security Guard',
    requestedBy: 'Supervisor Segurança',
    requestedByRole: UserRole.SUPERVISOR,
    status: TransferStatus.COMPLETED,
    currentStep: TransferStep.COMPLETED,
    reason: 'Solicitação de mudança de carreira',
    scheduledDate: subDays(new Date(), 3),
    completedAt: subDays(new Date(), 1),
    createdAt: subDays(new Date(), 10),
    contractorSystemConfirmed: true,
    contractorSystemName: 'Sistema Facility Pro',
    contractorSystemConfirmedBy: 'Admin RH',
    contractorSystemConfirmedAt: subDays(new Date(), 2),
    approvalHistory: [
      {
        id: '3',
        step: TransferStep.DESTINATION_APPROVAL,
        approvedBy: 'Gestor Facility',
        approvedByRole: UserRole.CONTRACT_MANAGER,
        approvedAt: subDays(new Date(), 8),
        action: 'APPROVED'
      },
      {
        id: '4',
        step: TransferStep.ADMIN_APPROVAL,
        approvedBy: 'Admin RH',
        approvedByRole: UserRole.HR,
        approvedAt: subDays(new Date(), 7),
        action: 'APPROVED'
      },
      {
        id: '5',
        step: TransferStep.CONTRACTOR_RELEASE,
        approvedBy: 'Planejador Facility',
        approvedByRole: UserRole.PLANNING,
        approvedAt: subDays(new Date(), 1),
        action: 'APPROVED'
      }
    ],
    safetyValidation: {
      isValid: true,
      missingTrainings: [],
      expiringASOs: [],
      expiringTrainings: [],
      validatedBy: 'Supervisor Segurança',
      validatedAt: subDays(new Date(), 9),
      notes: 'Transferência aprovada - requisitos básicos atendidos'
    }
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Emily Chen',
    fromContractId: '2',
    fromContract: 'Manufacturing Unit B',
    toContractId: '1',
    toContract: 'Construction Project Alpha',
    toFunction: 'Safety Officer',
    requestedBy: 'Gerente Operações',
    requestedByRole: UserRole.CONTRACT_MANAGER,
    status: TransferStatus.REJECTED,
    currentStep: TransferStep.DESTINATION_APPROVAL,
    reason: 'Atribuição temporária',
    scheduledDate: addDays(new Date(), 21),
    createdAt: subDays(new Date(), 8),
    approvalHistory: [
      {
        id: '6',
        step: TransferStep.DESTINATION_APPROVAL,
        approvedBy: 'Gestor Contrato A',
        approvedByRole: UserRole.CONTRACT_MANAGER,
        approvedAt: subDays(new Date(), 6),
        action: 'REJECTED',
        comments: 'Não há vaga disponível no momento'
      }
    ],
    safetyValidation: {
      isValid: false,
      missingTrainings: ['Trabalho em Altura', 'Soldagem Industrial'],
      expiringASOs: ['ASO vence em 10 dias'],
      expiringTrainings: [],
      validatedBy: 'Sistema Automático',
      validatedAt: subDays(new Date(), 7),
      notes: 'Múltiplas pendências de segurança identificadas'
    }
  }
]

export const mockASOs: ASO[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Mitchell',
    examType: ASOType.PERIODIC,
    examDate: subDays(new Date(), 30),
    validUntil: addDays(new Date(), 335),
    result: ASOResult.FIT,
    status: 'valid'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    examType: ASOType.PERIODIC,
    examDate: subDays(new Date(), 320),
    validUntil: addDays(new Date(), 45),
    result: ASOResult.FIT,
    status: 'expiring'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Michael Rodriguez',
    examType: ASOType.ADMISSIONAL,
    examDate: subDays(new Date(), 60),
    validUntil: addDays(new Date(), 305),
    result: ASOResult.FIT,
    status: 'valid'
  },
  {
    id: '4',
    employeeId: '4',
    employeeName: 'Emily Chen',
    examType: ASOType.PERIODIC,
    examDate: subDays(new Date(), 350),
    validUntil: addDays(new Date(), 10),
    result: ASOResult.FIT,
    status: 'expiring'
  }
]

export const mockEmployeeTrainings: EmployeeTraining[] = [
  {
    id: '1',
    employeeId: '1',
    trainingId: '1',
    trainingName: 'Treinamento Básico de Segurança',
    completedAt: subDays(new Date(), 60),
    validUntil: addDays(new Date(), 305),
    status: 'valid'
  },
  {
    id: '2',
    employeeId: '1',
    trainingId: '2',
    trainingName: 'Gestão Avançada de Segurança',
    completedAt: subDays(new Date(), 400),
    validUntil: addDays(new Date(), 330),
    status: 'expiring'
  },
  {
    id: '3',
    employeeId: '2',
    trainingId: '1',
    trainingName: 'Treinamento Básico de Segurança',
    completedAt: subDays(new Date(), 200),
    validUntil: addDays(new Date(), 165),
    status: 'valid'
  },
  {
    id: '4',
    employeeId: '2',
    trainingId: '4',
    trainingName: 'Padrões de Controle de Qualidade',
    completedAt: subDays(new Date(), 450),
    validUntil: subDays(new Date(), 5),
    status: 'expired'
  },
  {
    id: '5',
    employeeId: '3',
    trainingId: '1',
    trainingName: 'Treinamento Básico de Segurança',
    completedAt: subDays(new Date(), 30),
    validUntil: addDays(new Date(), 335),
    status: 'valid'
  },
  {
    id: '6',
    employeeId: '3',
    trainingId: '5',
    trainingName: 'Trabalho em Altura',
    completedAt: subDays(new Date(), 45),
    validUntil: addDays(new Date(), 320),
    status: 'valid'
  },
  {
    id: '7',
    employeeId: '4',
    trainingId: '1',
    trainingName: 'Treinamento Básico de Segurança',
    completedAt: subDays(new Date(), 100),
    validUntil: addDays(new Date(), 265),
    status: 'valid'
  },
  {
    id: '8',
    employeeId: '4',
    trainingId: '4',
    trainingName: 'Padrões de Controle de Qualidade',
    completedAt: subDays(new Date(), 80),
    validUntil: addDays(new Date(), 465),
    status: 'valid'
  }
]

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@demo-company.com',
    name: 'Admin User',
    role: UserRole.TENANT_ADMIN,
    isActive: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: subDays(new Date(), 365)
  },
  {
    id: '2',
    email: 'hr@demo-company.com',
    name: 'HR Manager',
    role: UserRole.HR,
    isActive: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hr',
    createdAt: subDays(new Date(), 200)
  },
  {
    id: '3',
    email: 'safety@demo-company.com',
    name: 'Safety Officer',
    role: UserRole.SAFETY,
    isActive: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=safety',
    createdAt: subDays(new Date(), 150)
  }
]

// Função para validar transferência baseada em requisitos de segurança
export const validateTransferSafety = (
  employeeId: string, 
  toContractId: string, 
  asoExpirationDays: number = 15
): TransferSafetyValidation => {
  const employee = mockEmployees.find(e => e.id === employeeId)
  const toContract = mockContracts.find(c => c.id === toContractId)
  
  if (!employee || !toContract) {
    return {
      isValid: false,
      missingTrainings: ['Funcionário ou contrato não encontrado'],
      expiringASOs: [],
      expiringTrainings: []
    }
  }

  const employeeTrainings = mockEmployeeTrainings.filter(t => t.employeeId === employeeId)
  const employeeASOs = mockASOs.filter(a => a.employeeId === employeeId)
  
  // Verificar treinamentos obrigatórios
  const requiredTrainingIds = toContract.requiredTrainings
    .filter(rt => rt.isImpeditive)
    .map(rt => rt.trainingId)
  
  const missingTrainings: string[] = []
  const expiringTrainings: string[] = []
  
  requiredTrainingIds.forEach(trainingId => {
    const employeeTraining = employeeTrainings.find(et => et.trainingId === trainingId)
    const training = mockTrainings.find(t => t.id === trainingId)
    
    if (!employeeTraining) {
      missingTrainings.push(training?.name || `Treinamento ID: ${trainingId}`)
    } else if (employeeTraining.status === 'expired') {
      missingTrainings.push(`${training?.name} (Expirado)`)
    } else if (employeeTraining.status === 'expiring') {
      expiringTrainings.push(training?.name || `Treinamento ID: ${trainingId}`)
    }
  })
  
  // Verificar ASOs
  const expiringASOs: string[] = []
  const now = new Date()
  const expirationThreshold = addDays(now, asoExpirationDays)
  
  employeeASOs.forEach(aso => {
    if (aso.validUntil <= expirationThreshold) {
      expiringASOs.push(`ASO ${aso.examType} vence em ${Math.ceil((aso.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dias`)
    }
  })
  
  const isValid = missingTrainings.length === 0 && expiringASOs.length === 0
  
  return {
    isValid,
    missingTrainings,
    expiringASOs,
    expiringTrainings,
    validatedBy: 'Sistema Automático',
    validatedAt: new Date(),
    notes: isValid ? 
      'Todos os requisitos de segurança atendidos' : 
      'Pendências de segurança identificadas - transferência bloqueada'
  }
}

// Dashboard Statistics
export const getDashboardStats = () => {
  const totalEmployees = mockEmployees.length
  const activeEmployees = mockEmployees.filter(e => e.isActive).length
  const totalContracts = mockContracts.length
  const activeContracts = mockContracts.filter(c => c.isActive).length
  const pendingTransfers = mockTransferRequests.filter(t => 
    t.status === TransferStatus.PENDING_DESTINATION_APPROVAL ||
    t.status === TransferStatus.PENDING_ADMIN_APPROVAL ||
    t.status === TransferStatus.PENDING_CONTRACTOR_SYSTEM ||
    t.status === TransferStatus.PENDING_CONTRACTOR_RELEASE
  ).length
  const blockedTransfers = mockTransferRequests.filter(t => t.status === TransferStatus.BLOCKED_SAFETY).length
  const expiringASOs = mockASOs.filter(a => a.status === 'expiring').length
  const expiredTrainings = mockEmployeeTrainings.filter(t => t.status === 'expired').length

  return {
    totalEmployees,
    activeEmployees,
    totalContracts,
    activeContracts,
    pendingTransfers,
    blockedTransfers,
    expiringASOs,
    expiredTrainings,
    complianceRate: Math.round(((totalEmployees - expiredTrainings) / totalEmployees) * 100)
  }
}
