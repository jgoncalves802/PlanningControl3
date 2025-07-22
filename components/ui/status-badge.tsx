import React from 'react';
import { cn } from '@/lib/utils';

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TRANSFERRED' | 'SUSPENDED' | 'DISMISSED' | 'RETIRED' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: EmployeeStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  ACTIVE: {
    label: 'Ativo',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500'
  },
  ON_LEAVE: {
    label: 'Em Licença',
    className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500'
  },
  TRANSFERRED: {
    label: 'Transferido',
    className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    dotColor: 'bg-blue-500'
  },
  SUSPENDED: {
    label: 'Suspenso',
    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    dotColor: 'bg-orange-500'
  },
  DISMISSED: {
    label: 'Demitido',
    className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    dotColor: 'bg-red-500'
  },
  RETIRED: {
    label: 'Aposentado',
    className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800',
    dotColor: 'bg-slate-500'
  },
  // Fallbacks para status antigos ou inválidos
  active: {
    label: 'Ativo',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500'
  },
  inactive: {
    label: 'Inativo',
    className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
    dotColor: 'bg-gray-500'
  }
};

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs font-medium',
  md: 'px-3 py-1.5 text-sm font-medium',
  lg: 'px-4 py-2 text-base font-medium'
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5'
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status as EmployeeStatus] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
    dotColor: 'bg-gray-500'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border shadow-sm',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <div className={cn('rounded-full', dotSizes[size], config.dotColor)}></div>
      {config.label}
    </span>
  );
}

export function getStatusColor(status: EmployeeStatus | string) {
  const config = statusConfig[status as EmployeeStatus];
  return config?.className || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: EmployeeStatus | string) {
  const config = statusConfig[status as EmployeeStatus];
  return config?.label || status;
} 