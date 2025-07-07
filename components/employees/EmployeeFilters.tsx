'use client'

import React, { memo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockContracts } from '@/lib/mock-data';

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterContract: string;
  setFilterContract: (contract: string) => void;
  filterFunction: string;
  setFilterFunction: (func: string) => void;
  filterAdmission: string;
  setFilterAdmission: (date: string) => void;
  filterCity: string;
  setFilterCity: (city: string) => void;
  filterDismissal: string;
  setFilterDismissal: (date: string) => void;
  onClearFilters: () => void;
}

const EmployeeFilters = memo(function EmployeeFilters({
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
  onClearFilters
}: EmployeeFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-end">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar funcionários por nome, CPF ou contrato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="on_leave">Em Licença</option>
              <option value="transferred">Transferido</option>
              <option value="dismissed">Demitido</option>
            </select>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                <Filter className="h-4 w-4 mr-2" />
                Mais Filtros
              </Button>
              {showFilters && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Filtros Avançados</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        setShowFilters(false);
                      }}
                      className="space-y-4"
                    >
                      {/* Contrato */}
                      <div>
                        <label htmlFor="filter-contract" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Contrato</label>
                        <select
                          id="filter-contract"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          value={filterContract}
                          onChange={e => { setFilterContract(e.target.value); setFilterFunction(''); }}
                        >
                          <option value="">Todos os contratos</option>
                          {mockContracts.map(contract => (
                            <option key={contract.id} value={contract.id}>{contract.name}</option>
                          ))}
                        </select>
                      </div>
                      {/* Função */}
                      <div>
                        <label htmlFor="filter-function" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cargo</label>
                        <select
                          id="filter-function"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          value={filterFunction}
                          onChange={e => setFilterFunction(e.target.value)}
                          disabled={!filterContract}
                        >
                          <option value="">Todas as funções</option>
                          {filterContract && mockContracts.find(c => c.id === filterContract)?.functions.map(func => (
                            <option key={func.id} value={func.id}>{func.name}</option>
                          ))}
                        </select>
                      </div>
                      {/* Data de Admissão */}
                      <div>
                        <label htmlFor="filter-admission" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Data de Entrada</label>
                        <input
                          id="filter-admission"
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          value={filterAdmission}
                          onChange={e => setFilterAdmission(e.target.value)}
                        />
                      </div>
                      {/* Cidade */}
                      <div>
                        <label htmlFor="filter-city" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Cidade</label>
                        <input
                          id="filter-city"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          value={filterCity}
                          onChange={e => setFilterCity(e.target.value)}
                          placeholder="Cidade"
                        />
                      </div>
                      {/* Data de Demissão */}
                      <div>
                        <label htmlFor="filter-dismissal" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Data de Demissão</label>
                        <input
                          id="filter-dismissal"
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                          value={filterDismissal}
                          onChange={e => setFilterDismissal(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between gap-2 mt-6">
                        <Button type="button" variant="secondary" onClick={onClearFilters}>
                          Limpar
                        </Button>
                        <Button type="submit" variant="primary">
                          Aplicar
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default EmployeeFilters; 