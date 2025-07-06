import { useQuery } from '@tanstack/react-query';
import { getEmployees } from './employeeService';

export function useEmployeesQuery() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });
} 