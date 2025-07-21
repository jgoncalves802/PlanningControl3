'use client'

import React, { memo } from 'react';
import { Employee } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Clock, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ColumnConfig {
  key: string;
  label: string;
  enabled: boolean;
  width?: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  columns: ColumnConfig[];
  selectedEmployees: string[];
  canManageEmployees: boolean;
  onSelectEmployee: (id: string) => void;
  onSelectAll: () => void;
  onViewEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onShowHistory: (employee: Employee) => void;
  selectedContractId?: string; // NOVO
}

const EmployeeTable = memo(function EmployeeTable({
  employees,
  columns,
  selectedEmployees,
  canManageEmployees,
  onSelectEmployee,
  onSelectAll,
  onViewEmployee,
  onEditEmployee,
  onShowHistory,
  selectedContractId // NOVO
}: EmployeeTableProps) {
  const enabledColumns = columns.filter(col => col.enabled);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'transferred': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'on_leave': return 'Em Licença'
      case 'transferred': return 'Transferido'
      case 'dismissed': return 'Demitido'
      default: return status
    }
  };

  function formatDateInput(date: Date | string) {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  const renderCellContent = (employee: Employee, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                {employee.avatar ? (
                  <img 
                    src={employee.avatar} 
                    alt={employee.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              {/* Indicador de status online/offline */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{employee.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {employee.email && (
                  <div className="group relative cursor-help">
                    <Mail className="h-3 w-3 text-blue-500 hover:text-blue-600 transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                      {employee.email}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
                    </div>
                  </div>
                )}
                {employee.phone && (
                  <div className="group relative cursor-help">
                    <Phone className="h-3 w-3 text-green-500 hover:text-green-600 transition-colors" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                      {employee.phone}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-slate-700"></div>
                    </div>
                  </div>
                )}
                {employee.cpf && (
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                    {employee.id.padStart(6, '0')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      case 'cpf':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.cpf}</span>;
      case 'matricula':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.id ? employee.id.padStart(6, '0') : '-'}</span>;
      case 'cargo':
        // Usar companyFunctionId para buscar o nome da função
        let cargoDisplay = '-';
        
        // Se tem companyFunctionId, usar companyFunction.name
        if (employee.companyFunctionId && employee.companyFunction?.name) {
          cargoDisplay = employee.companyFunction.name;
        }
        // Se não tem companyFunction mas tem currentFunction
        else if (employee.currentFunction) {
          if (typeof employee.currentFunction === 'object' && employee.currentFunction?.name) {
            cargoDisplay = employee.currentFunction.name;
          } else if (typeof employee.currentFunction === 'string') {
            cargoDisplay = employee.currentFunction;
          }
        }
        
        return <span className="text-sm text-gray-900 dark:text-slate-100">{cargoDisplay}</span>;
      case 'nfc':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.nfcCardId || '-'}</span>;
      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusColor(employee.status)}`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
              employee.status === 'active' ? 'bg-green-600' : 
              employee.status === 'on_leave' ? 'bg-yellow-600' : 
              employee.status === 'transferred' ? 'bg-blue-600' : 'bg-gray-600'
            }`}></div>
            {getStatusLabel(employee.status)}
          </span>
        );
      case 'cidade':
        return <span className="text-sm text-gray-900 dark:text-slate-100">São Paulo</span>;
      case 'telefone':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.phone || '-'}</span>;
      case 'dataEntrada':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{formatDate(employee.admissionDate)}</span>;
      case 'contrato':
        const contratoDisplay = typeof employee.currentContract === 'string' 
          ? employee.currentContract 
          : employee.currentContract?.name || 'Não atribuído';
        return <span className="text-sm text-gray-900 dark:text-slate-100">{contratoDisplay}</span>;
      case 'centroCusto':
        return <span className="text-sm text-gray-900 dark:text-slate-100">CC-{Math.floor(Math.random() * 1000)}</span>;
      case 'turno':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Diurno</span>;
      case 'obra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Obra A</span>;
      case 'primeiraExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Construção Civil</span>;
      case 'segundaExperiencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">Soldagem</span>;
      case 'previsaoObra':
        return <span className="text-sm text-gray-900 dark:text-slate-100">12 meses</span>;
      case 'mo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.mo || '-'}</span>;
      case 'horasNormaisTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNormaisTrabalhadas ?? '-'}</span>;
      case 'horasExtrasTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasExtrasTrabalhadas ?? '-'}</span>;
      case 'horasNoturnasTrabalhadas':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNoturnasTrabalhadas ?? '-'}</span>;
      case 'localAlojado':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.localAlojado || '-'}</span>;
      case 'bairro':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.address?.bairro || '-'}</span>;
      case 'pontoReferencia':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.pontoReferencia || '-'}</span>;
      case 'statusBancodoc':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.statusBancodoc || '-'}</span>;
      case 'efetivoRDO':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.efetivoRDO ? 'Sim' : 'Não'}</span>;
      case 'dismissalDate':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.dismissalDate ? formatDateInput(employee.dismissalDate) : '-'}</span>;
      case 'contractAssignmentDate':
        return (
          <span className="text-sm text-gray-900 dark:text-slate-100">
            {employee['contractAssignmentDate']
              ? formatDateInput(employee['contractAssignmentDate'])
              : '-'}
          </span>
        );
      default:
        return <span className="text-sm text-gray-500 dark:text-slate-400">-</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-b border-gray-200 dark:border-slate-600">
          <tr>
            {canManageEmployees && (
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === employees.length && employees.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </th>
            )}
            {enabledColumns.map((column) => (
              <th 
                key={column.key} 
                style={{ width: column.width }}
                className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {employees.map((employee, index) => {
            const isLinkedToSelected = selectedContractId && employee.currentContractId === selectedContractId;
            return (
              <tr 
                key={employee.id} 
                className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/30 dark:bg-slate-800/50'
                }`}
              >
                {canManageEmployees && (
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => onSelectEmployee(employee.id)}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-0"
                      disabled={isLinkedToSelected}
                    />
                  </td>
                )}
                {enabledColumns.map((column) => (
                  <td key={column.key} className="p-4">
                    {renderCellContent(employee, column.key)}
                  </td>
                ))}
                <td className="p-4 flex gap-2">
                  <button onClick={() => onViewEmployee(employee)} title="Visualizar" className="hover:bg-gray-100 dark:hover:bg-slate-700 rounded p-1" disabled={!employee.id}>
                    <Eye className="w-5 h-5 text-gray-500 hover:text-primary transition-colors" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => onEditEmployee(employee)} title="Editar" className="hover:bg-gray-100 dark:hover:bg-slate-700 rounded p-1" disabled={!employee.id}>
                    <Pencil className="w-5 h-5 text-gray-500 hover:text-primary transition-colors" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => onShowHistory(employee)} title="Histórico" className="hover:bg-gray-100 dark:hover:bg-slate-700 rounded p-1" disabled={!employee.id}>
                    <Clock className="w-5 h-5 text-gray-500 hover:text-primary transition-colors" strokeWidth={1.5} />
                  </button>
                  {/* Outras ações */}
                  {isLinkedToSelected && (
                    <button
                      className="text-blue-600 hover:underline text-sm font-medium"
                      onClick={() => alert('Solicitar transferência para gestor do contrato atual (implementar fluxo)')}
                      disabled={!employee.id}
                    >
                      Solicitar transferência
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default EmployeeTable; 