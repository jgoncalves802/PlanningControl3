export interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'
  companyId?: string
  isActive: boolean
  avatar?: string
  createdAt: Date
}

