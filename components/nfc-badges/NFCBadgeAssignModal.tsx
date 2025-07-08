'use client';

import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, AssignNFCBadgeData } from '@/lib/types/nfc-badges';
import { useAssignNFCBadge } from '@/lib/useNFCBadges';
import { useEmployeesQuery } from '@/lib/useEmployeesQuery';

interface NFCBadgeAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: NFCBadge | null;
}

export default function NFCBadgeAssignModal({ isOpen, onClose, badge }: NFCBadgeAssignModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const assignMutation = useAssignNFCBadge();
  const { data: employeesData } = useEmployeesQuery({
    search: searchTerm,
    isActive: true,
    limit: 50,
  });

  const isLoading = assignMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeId('');
      setSearchTerm('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedEmployeeId) {
      newErrors.employeeId = 'Selecione um funcionário';
    }

    if (notes && notes.length > 500) {
      newErrors.notes = 'Observações devem ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!badge || !validateForm()) return;

    try {
      const assignData: AssignNFCBadgeData = {
        employeeId: selectedEmployeeId,
        notes: notes || undefined,
      };
      await assignMutation.mutateAsync({ id: badge.id, data: assignData });
      onClose();
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  if (!isOpen || !badge) return null;

  const employees = employeesData?.employees || [];
  const filteredEmployees = employees.filter(emp => 
    !emp.nfcBadge || emp.nfcBadge.status !== 'ASSIGNED'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            Atribuir Crachá
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Informações do Crachá */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Crachá Selecionado</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {badge.badgeId.slice(-2)}
                </span>
              </div>
              <div>
                <p className="font-medium text-blue-900">ID: {badge.badgeId}</p>
                <p className="text-sm text-blue-700">Status: Disponível</p>
              </div>
            </div>
          </div>

          {/* Busca de Funcionários */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Funcionário *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Digite o nome ou CPF do funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Lista de Funcionários */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Funcionário *
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhum funcionário encontrado' : 'Digite para buscar funcionários'}
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedEmployeeId === employee.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="employee"
                        value={employee.id}
                        checked={selectedEmployeeId === employee.id}
                        onChange={() => setSelectedEmployeeId(employee.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{employee.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {employee.registration && `Mat: ${employee.registration} • `}
                          CPF: {employee.cpf}
                          {employee.company && ` • ${employee.company}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {errors.employeeId && (
              <p className="text-red-500 text-sm mt-1">{errors.employeeId}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              placeholder="Observações sobre a atribuição..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {notes.length}/500 caracteres
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Atribuindo...' : 'Atribuir Crachá'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 