'use client'

import React, { memo } from 'react';
import { Employee } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal, Mail, Phone } from 'lucide-react';
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
  onShowHistory
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
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-slate-600 shadow-sm">
              {employee.avatar ? (
                <img 
                  src={employee.avatar} 
                  alt={employee.name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{employee.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {employee.email && (
                  <div className="group relative cursor-help">
                    <Mail className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      {employee.email}
                    </div>
                  </div>
                )}
                {employee.phone && (
                  <div className="group relative cursor-help">
                    <Phone className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      {employee.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'cpf':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.cpf}</span>;
      case 'matricula':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.id.padStart(6, '0')}</span>;
      case 'cargo':
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentFunction || 'Não atribuído'}</span>;
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
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
        return <span className="text-sm text-gray-900 dark:text-slate-100">{employee.currentContract || 'Não atribuído'}</span>;
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
      default:
        return <span className="text-sm text-gray-500 dark:text-slate-400">-</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <tr>
            {canManageEmployees && (
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === employees.length}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                />
              </th>
            )}
            {enabledColumns.map((column) => (
              <th 
                key={column.key} 
                style={{ width: column.width }}
                className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                {column.label}
              </th>
            ))}
            <th className="text-left p-4 text-sm font-medium text-gray-700 dark:text-slate-300">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
              {canManageEmployees && (
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => onSelectEmployee(employee.id)}
                    className="rounded border-gray-300 dark:border-slate-600 text-primary focus:ring-primary"
                  />
                </td>
              )}
              {enabledColumns.map((column) => (
                <td key={column.key} className="p-4">
                  {renderCellContent(employee, column.key)}
                </td>
              ))}
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="group relative">
                    <Button variant="ghost" size="sm" onClick={() => onViewEmployee(employee)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      Visualizar detalhes
                    </div>
                  </div>
                  <div className="group relative">
                    <Button variant="ghost" size="sm" onClick={() => onEditEmployee(employee)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      Editar funcionário
                    </div>
                  </div>
                  <div className="group relative">
                    <Button variant="ghost" size="sm" onClick={() => onShowHistory(employee)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-slate-700 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      Histórico de vínculos
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default EmployeeTable; 