'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, RevokeNFCBadgeData } from '@/lib/types/nfc-badges';
import { useRevokeNFCBadge } from '@/lib/useNFCBadges';

interface NFCBadgeRevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: NFCBadge | null;
}

export default function NFCBadgeRevokeModal({ isOpen, onClose, badge }: NFCBadgeRevokeModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const revokeMutation = useRevokeNFCBadge();
  const isLoading = revokeMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (notes && notes.length > 500) {
      newErrors.notes = 'Observações devem ter no máximo 500 caracteres';
    }

    if (reason && reason.length > 500) {
      newErrors.reason = 'Motivo deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!badge || !validateForm()) return;

    try {
      const revokeData: RevokeNFCBadgeData = {
        reason: reason || undefined,
        notes: notes || undefined,
      };
      await revokeMutation.mutateAsync({ id: badge.id, data: revokeData });
      onClose();
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  if (!isOpen || !badge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Revogar Crachá
            </h2>
          </div>
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
          {/* Aviso */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Atenção!</h3>
                <p className="text-sm text-red-700 mt-1">
                  Esta ação irá revogar o crachá e remover a vinculação com o funcionário. 
                  O crachá ficará bloqueado e não poderá ser usado até ser reativado.
                </p>
              </div>
            </div>
          </div>

          {/* Informações do Crachá */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Crachá a ser Revogado</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {badge.badgeId.slice(-2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">ID: {badge.badgeId}</p>
                  <p className="text-sm text-gray-600">Status: Atribuído</p>
                </div>
              </div>
              
              {badge.employee && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{badge.employee.name}</p>
                    <p className="text-sm text-gray-600">
                      {badge.employee.registration && `Mat: ${badge.employee.registration} • `}
                      CPF: {badge.employee.cpf}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo da Revogação
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Selecione um motivo</option>
              <option value="Perda do crachá">Perda do crachá</option>
              <option value="Crachá danificado">Crachá danificado</option>
              <option value="Demissão do funcionário">Demissão do funcionário</option>
              <option value="Transferência">Transferência</option>
              <option value="Suspeita de uso indevido">Suspeita de uso indevido</option>
              <option value="Manutenção preventiva">Manutenção preventiva</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              placeholder="Descreva detalhes sobre a revogação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
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
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Revogando...' : 'Revogar Crachá'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
