import React from 'react';
import { StatusBadge } from './status-badge';
import { EmployeeStatus } from './status-badge';

interface StatusLegendProps {
  className?: string;
  showActiveStatus?: boolean;
}

const statusInfo = [
  {
    status: 'ACTIVE' as EmployeeStatus,
    description: 'Trabalhando normalmente'
  },
  {
    status: 'ON_LEAVE' as EmployeeStatus,
    description: 'Licença médica ou férias'
  },
  {
    status: 'TRANSFERRED' as EmployeeStatus,
    description: 'Outro contrato/obra'
  },
  {
    status: 'SUSPENDED' as EmployeeStatus,
    description: 'Temporariamente suspenso'
  },
  {
    status: 'DISMISSED' as EmployeeStatus,
    description: 'Demitido da empresa'
  },
  {
    status: 'RETIRED' as EmployeeStatus,
    description: 'Aposentado'
  }
];

export function StatusLegend({ className, showActiveStatus = true }: StatusLegendProps) {
  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-xs font-medium text-gray-700 dark:text-slate-300 mr-2">
          Status:
        </span>
        {statusInfo.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <StatusBadge status={item.status} size="sm" />
            {showActiveStatus && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {item.status === 'DISMISSED' || item.status === 'RETIRED' ? '❌' : '✅'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusLegendCompact({ className }: StatusLegendProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statusInfo.map((item) => (
        <div key={item.status} className="flex items-center gap-2">
          <StatusBadge status={item.status} size="sm" />
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {item.status === 'DISMISSED' || item.status === 'RETIRED' ? '❌' : '✅'}
          </span>
        </div>
      ))}
    </div>
  );
} 