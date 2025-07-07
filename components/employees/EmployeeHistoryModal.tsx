'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { X, History, Calendar, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Employee } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

interface EmployeeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeHistoryModal: React.FC<EmployeeHistoryModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  if (!isOpen || !employee) return null;

  // Mock data para histórico - em produção viria da API
  const historyData = [
    {
      id: 1,
      type: 'admission',
      date: employee.admissionDate,
      contract: employee.currentContract,
      function: employee.currentFunction,
      description: 'Admissão inicial',
      status: 'active'
    },
    {
      id: 2,
      type: 'transfer',
      date: new Date('2024-06-15'),
      contract: 'CONTRATO-002',
      function: 'Encarregado',
      description: 'Transferência para novo contrato com promoção',
      status: 'active'
    },
    {
      id: 3,
      type: 'leave',
      date: new Date('2024-08-01'),
      contract: employee.currentContract,
      function: employee.currentFunction,
      description: 'Licença médica',
      status: 'on_leave'
    },
    {
      id: 4,
      type: 'return',
      date: new Date('2024-08-15'),
      contract: employee.currentContract,
      function: employee.currentFunction,
      description: 'Retorno da licença médica',
      status: 'active'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admission':
        return <User className="h-4 w-4 text-green-600" />;
      case 'transfer':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'leave':
        return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'return':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'dismissal':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'admission':
        return 'Admissão';
      case 'transfer':
        return 'Transferência';
      case 'leave':
        return 'Licença';
      case 'return':
        return 'Retorno';
      case 'dismissal':
        return 'Demissão';
      default:
        return 'Evento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'transferred':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'dismissed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'on_leave':
        return 'Em Licença';
      case 'transferred':
        return 'Transferido';
      case 'dismissed':
        return 'Demitido';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-slate-600 shadow-sm">
              {employee.avatar ? (
                <img 
                  src={employee.avatar} 
                  alt={employee.name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-white text-lg font-medium">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Histórico de Vínculos
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {employee.name} - Matrícula: {employee.id.padStart(6, '0')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {historyData.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline Line */}
                {index < historyData.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-slate-600" />
                )}
                
                {/* Timeline Item */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-slate-600 shadow-sm">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                          {getTypeLabel(item.type)}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          Contrato:
                        </span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-slate-100">
                          {item.contract || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
                          Função:
                        </span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-slate-100">
                          {item.function || '-'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State */}
          {historyData.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
                Nenhum histórico encontrado
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Este funcionário ainda não possui histórico de vínculos registrado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Total de eventos: {historyData.length}
          </div>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeHistoryModal; 