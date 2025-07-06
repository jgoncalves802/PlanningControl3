import type { Employee } from '@/lib/mock-data';

// Troque a implementação para Supabase futuramente
// Hoje usa mock, amanhã pode ser fetch/axios para backend próprio

export async function getEmployees(): Promise<Employee[]> {
  // Exemplo com mock, troque para Supabase ou fetch API
  const { mockEmployees } = await import('@/lib/mock-data');
  return mockEmployees;
}

export async function createEmployee(newEmployee: Employee): Promise<Employee> {
  // Implemente com Supabase ou fetch API
  throw new Error('Not implemented');
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  // Implemente com Supabase ou fetch API
  throw new Error('Not implemented');
}

export async function deleteEmployee(id: string): Promise<void> {
  // Implemente com Supabase ou fetch API
  throw new Error('Not implemented');
} 