import { useState, useMemo } from 'react';
import { Employee } from '@/lib/mock-data';

export function useEmployeeFilters(employees: Employee[] | undefined) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterContract, setFilterContract] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterAdmission, setFilterAdmission] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterDismissal, setFilterDismissal] = useState('');

  function formatDateInput(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  const filteredEmployees = useMemo(() => {
    if (!employees || !Array.isArray(employees)) {
      return [];
    }

    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.cpf.includes(searchTerm) ||
                           (typeof employee.currentContract === 'string' 
                             ? employee.currentContract.toLowerCase().includes(searchTerm.toLowerCase())
                             : employee.currentContract?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const matchesContract = !filterContract || employee.currentContractId === filterContract;
      const matchesFunction = !filterFunction || employee.currentFunctionId === filterFunction;
      const matchesAdmission = !filterAdmission || (employee.admissionDate && formatDateInput(employee.admissionDate) === filterAdmission);
      const matchesCity = !filterCity || (
        (employee.address && typeof employee.address === 'object' && employee.address.cidade?.toLowerCase().includes(filterCity.toLowerCase())) ||
        (employee.endereco && typeof employee.endereco === 'object' && employee.endereco.cidade?.toLowerCase().includes(filterCity.toLowerCase())) ||
        ((employee as any).cidade && (employee as any).cidade.toLowerCase().includes(filterCity.toLowerCase()))
      );
      const matchesDismissal = !filterDismissal || (employee.dismissalDate && formatDateInput(employee.dismissalDate) === filterDismissal);

      return matchesSearch && matchesStatus && matchesContract && matchesFunction && matchesAdmission && matchesCity && matchesDismissal;
    });
  }, [employees, searchTerm, statusFilter, filterContract, filterFunction, filterAdmission, filterCity, filterDismissal]);

  const clearFilters = () => {
    setFilterContract('');
    setFilterFunction('');
    setFilterAdmission('');
    setFilterCity('');
    setFilterDismissal('');
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    filterContract,
    setFilterContract,
    filterFunction,
    setFilterFunction,
    filterAdmission,
    setFilterAdmission,
    filterCity,
    setFilterCity,
    filterDismissal,
    setFilterDismissal,
    filteredEmployees,
    clearFilters
  };
} 