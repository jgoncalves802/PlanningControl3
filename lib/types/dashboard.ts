export interface DashboardStats {
  // Core metrics
  totalEmployees: number
  activeEmployees: number
  totalContracts: number
  activeContracts: number
  totalFunctions: number
  activeFunctions: number
  
  // Labor distribution
  directLaborEmployees: number
  indirectLaborEmployees: number
  
  // Assignment metrics
  functionsWithEmployees: number
  employeesWithFunctions: number
  complianceRate: number
  
  // Recent activity (last 30 days)
  recentActivity: {
    employees: number
    contracts: number
    functions: number
  }
  
  // Calculated metrics
  averageEmployeesPerContract: number
  averageEmployeesPerFunction: number
  
  // Timestamp
  lastUpdated: string
}

export interface DashboardFilters {
  dateRange?: {
    from: Date
    to: Date
  }
  contractIds?: string[]
  functionIds?: string[]
} 