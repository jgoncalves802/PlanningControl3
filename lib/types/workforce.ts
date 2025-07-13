export interface WorkforceEntry {
  id: string
  employeeId: string
  employeeName: string
  contractId?: string
  contractName?: string
  functionName?: string
  nfcCardId?: string
  checkInTime?: Date
  checkOutTime?: Date
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEFT'
  location?: string
  hoursWorked?: number
  isLate: boolean
  action?: 'check_in' | 'check_out'
  createdAt: Date
  updatedAt: Date
}

export interface WorkforceStats {
  totalEmployees: number
  present: number
  absent: number
  late: number
  left: number
  presenceRate: number
  averageCheckInTime?: string
  lastUpdated: Date
}

export interface WorkforceFilters {
  contractId?: string
  status?: string[]
  functionIds?: string[]
  location?: string
  search?: string
  dateRange?: {
    from: Date
    to?: Date
  }
}

export interface NFCReadData {
  nfcCardId: string
  timestamp: Date
  location?: string
  action?: 'check_in' | 'check_out'
}

export interface CreateWorkforceEntryData {
  employeeId: string
  contractId?: string
  checkInTime?: Date
  checkOutTime?: Date
  location?: string
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEFT'
} 