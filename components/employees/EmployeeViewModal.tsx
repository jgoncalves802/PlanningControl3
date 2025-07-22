'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { X, User, FileText, Phone, MapPin, Briefcase, Clock, StickyNote, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Employee } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  role: string;
}

interface EmployeeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEditEmployee?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  onShowHistory?: (employee: Employee) => void;
  currentUser?: User;
}

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEditEmployee,
  onDelete,
  onShowHistory,
  currentUser
}) => {
  if (!isOpen || !employee) return null;

  const canManageEmployees = currentUser?.role === 'TENANT_ADMIN' || currentUser?.role === 'HR';

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
                {employee.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(employee.status)}`}>
                  {getStatusLabel(employee.status)}
                </span>
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Matrícula: {employee.id.padStart(6, '0')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {onEditEmployee && (
              <Button variant="ghost" size="sm" onClick={() => onEditEmployee(employee)}>
                <Edit className="h-5 w-5" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(employee.id)}>
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
            {onShowHistory && (
              <Button variant="ghost" size="sm" onClick={() => onShowHistory(employee)}>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {/* Dados Pessoais */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Dados Pessoais
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Nome Completo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CPF
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.cpf}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    RG
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.rg || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Data de Nascimento
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {employee.birthDate ? formatDate(employee.birthDate) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Gênero
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {employee.gender === 'M' ? 'Masculino' : employee.gender === 'F' ? 'Feminino' : employee.gender || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Estado Civil
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.maritalStatus || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Nome da Mãe
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.motherName || '-'}</p>
                </div>
              </div>
            </div>

            {/* Documentos */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Documentos
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    PIS
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.pis || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CTPS
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.ctps || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CTPS Série
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.ctpsSeries || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CTPS UF
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.ctpsUf || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CNH
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.cnh || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CNH Categoria
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.cnhCategory || '-'}</p>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Contato
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.email || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Telefone
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Endereço
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Endereço Completo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {employee.address && typeof employee.address === 'object' 
                      ? `${employee.address.logradouro}, ${employee.address.numero}${employee.address.complemento ? `, ${employee.address.complemento}` : ''}, ${employee.address.bairro}, ${employee.address.cidade}/${employee.address.uf}`
                      : employee.endereco && typeof employee.endereco === 'object'
                      ? `${employee.endereco.logradouro}, ${employee.endereco.numero}${employee.endereco.complemento ? `, ${employee.endereco.complemento}` : ''}, ${employee.endereco.bairro}, ${employee.endereco.cidade}/${employee.endereco.uf}`
                      : typeof employee.address === 'string' 
                      ? employee.address
                      : typeof employee.endereco === 'string'
                      ? employee.endereco
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    CEP
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {employee.address && typeof employee.address === 'object' 
                      ? employee.address.cep
                      : employee.endereco && typeof employee.endereco === 'object'
                      ? employee.endereco.cep
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Profissional */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Informações Profissionais
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Cargo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {typeof employee.currentFunction === 'string' 
                      ? employee.currentFunction 
                      : employee.currentFunction?.name || employee.role || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Contrato
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {typeof employee.currentContract === 'string' 
                      ? employee.currentContract 
                      : employee.currentContract?.name || '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Data de Admissão
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {employee.admissionDate ? formatDate(employee.admissionDate) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Salário
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {(employee as any).salary ? `R$ ${(employee as any).salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Turno
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.shift || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Centro de Custo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.centroCusto || '-'}</p>
                </div>
              </div>
            </div>

            {/* Horários */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Controle de Horas
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Horas Normais
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNormaisTrabalhadas || 0}h</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Horas Extras
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.horasExtrasTrabalhadas || 0}h</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                    Horas Noturnas
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.horasNoturnasTrabalhadas || 0}h</p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {employee.notes && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <StickyNote className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    Observações
                  </h3>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-gray-900 dark:text-slate-100">{employee.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-2">
            {canManageEmployees && onEditEmployee && (
              <Button variant="outline" onClick={() => onEditEmployee(employee)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {onShowHistory && (
              <Button variant="outline" onClick={() => onShowHistory(employee)}>
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            )}
            {canManageEmployees && onDelete && (
              <Button 
                variant="danger" 
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este funcionário?')) {
                    onDelete(employee.id);
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmployeeViewModal; 
