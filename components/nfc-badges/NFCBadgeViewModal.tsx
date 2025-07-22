'use client';

import { X, CreditCard, User, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, NFCBadgeStatusLabels, NFCBadgeStatusColors, formatNFCBadgeId } from '@/lib/types/nfc-badges';

interface NFCBadgeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: NFCBadge | null;
}

export default function NFCBadgeViewModal({ isOpen, onClose, badge }: NFCBadgeViewModalProps) {
  if (!isOpen || !badge) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    const color = NFCBadgeStatusColors[badge.status];
    const label = NFCBadgeStatusLabels[badge.status];
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      gray: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            Detalhes do Crachá
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

        <div className="p-6 space-y-6">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crachá */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Informações do Crachá</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Crachá</label>
                  <p className="text-lg font-mono">{formatNFCBadgeId(badge.badgeId)}</p>
                  <p className="text-sm text-gray-500">Raw: {badge.badgeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge()}
                    {!badge.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Funcionário */}
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Funcionário Atribuído</h3>
              </div>
              {badge.employee ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome</label>
                    <p className="font-medium">{badge.employee.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p>{badge.employee.cpf}</p>
                  </div>
                  {badge.employee.registration && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Matrícula</label>
                      <p>{badge.employee.registration}</p>
                    </div>
                  )}
                  {badge.employee.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Empresa</label>
                      <p>{badge.employee.company}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum funcionário atribuído</p>
                </div>
              )}
            </Card>
          </div>

          {/* Histórico de Operações */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">Histórico</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado em</label>
                  <p>{formatDate(badge.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                  <p>{formatDate(badge.updatedAt)}</p>
                </div>
              </div>
              
              {badge.assignedAt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Atribuído em</label>
                    <p>{formatDate(badge.assignedAt)}</p>
                  </div>
                  {badge.assignedByUser && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Atribuído por</label>
                      <p>{badge.assignedByUser.name}</p>
                      <p className="text-sm text-gray-500">{badge.assignedByUser.email}</p>
                    </div>
                  )}
                </div>
              )}
              
              {badge.revokedAt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Revogado em</label>
                    <p>{formatDate(badge.revokedAt)}</p>
                  </div>
                  {badge.revokedByUser && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Revogado por</label>
                      <p>{badge.revokedByUser.name}</p>
                      <p className="text-sm text-gray-500">{badge.revokedByUser.email}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Observações */}
          {badge.notes && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium">Observações</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{badge.notes}</p>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
} 
