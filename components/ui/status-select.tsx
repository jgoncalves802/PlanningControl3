import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, EmployeeStatus } from './status-badge';

interface StatusSelectProps {
  value?: EmployeeStatus | string;
  onValueChange: (value: EmployeeStatus) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const statusOptions: { value: EmployeeStatus; label: string; description: string }[] = [
  {
    value: 'ACTIVE',
    label: 'Ativo',
    description: 'Funcionário ativo e trabalhando normalmente'
  },
  {
    value: 'ON_LEAVE',
    label: 'Em Licença',
    description: 'Funcionário em licença médica ou férias'
  },
  {
    value: 'TRANSFERRED',
    label: 'Transferido',
    description: 'Funcionário transferido para outro contrato/obra'
  },
  {
    value: 'SUSPENDED',
    label: 'Suspenso',
    description: 'Funcionário temporariamente suspenso'
  },
  {
    value: 'DISMISSED',
    label: 'Demitido',
    description: 'Funcionário demitido da empresa'
  },
  {
    value: 'RETIRED',
    label: 'Aposentado',
    description: 'Funcionário aposentado'
  }
];

export function StatusSelect({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o status",
  disabled = false,
  className 
}: StatusSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
    >
      <SelectTrigger className={className} disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-3 w-full py-1">
              <StatusBadge status={option.value} size="sm" />
              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {option.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StatusSelectSimple({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o status",
  disabled = false,
  className 
}: StatusSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
    >
      <SelectTrigger className={className} disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 