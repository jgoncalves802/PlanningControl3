'use client';

import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, NFCBadgeFilterData, formatNFCBadgeId, getNFCBadgeStatusColor, getNFCBadgeStatusLabel } from '@/lib/types/nfc-badges';
import { useNFCBadgesQuery } from '@/lib/useNFCBadges';
import NFCBadgeCreateModal from './NFCBadgeCreateModal';
import NFCBadgeAssignModal from './NFCBadgeAssignModal';
import NFCBadgeRevokeModal from './NFCBadgeRevokeModal';
import NFCBadgeViewModal from './NFCBadgeViewModal';
import NFCBadgeFilters from './NFCBadgeFilters';

interface NFCBadgesListProps {
  className?: string;
}

export default function NFCBadgesList({ className }: NFCBadgesListProps) {
  const [filters, setFilters] = useState({
    status: undefined,
    search: '',
    assignedEmployee: 'all',
    page: 1,
    limit: 10,
  });

  const [selectedBadge, setSelectedBadge] = useState<NFCBadge | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data, isLoading, error } = useNFCBadgesQuery(filters);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleAssignSuccess = () => {
    setIsAssignModalOpen(false);
    setSelectedBadge(null);
  };

  const handleRevokeSuccess = () => {
    setIsRevokeModalOpen(false);
    setSelectedBadge(null);
  };

  const handleViewBadge = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsViewModalOpen(true);
  };

  const handleAssignBadge = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsAssignModalOpen(true);
  };

  const handleRevokeBadge = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsRevokeModalOpen(true);
  };

  const canAssign = (badge: NFCBadge) => {
    return badge.status === 'AVAILABLE';
  };

  const canRevoke = (badge: NFCBadge) => {
    return badge.status === 'ASSIGNED';
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar crachás NFC</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Content */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando crachás...</p>
          </div>
        ) : data?.badges.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum crachá encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando o primeiro crachá NFC'}
            </p>
            {!filters.search && !filters.status && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Crachá
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.badges.map((badge) => (
              <div key={badge.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Badge Icon */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Badge Info */}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNFCBadgeId(badge.badgeId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {badge.badgeId}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNFCBadgeStatusColor(badge.status)}`}>
                          {getNFCBadgeStatusLabel(badge.status)}
                        </span>
                        {badge.assignedAt && (
                          <span className="ml-2 text-xs text-gray-500">
                            Atribuído em {new Date(badge.assignedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Employee Info */}
                    {badge.assignedEmployee && (
                      <div className="ml-6 flex items-center">
                        <div className="flex-shrink-0">
                          {badge.assignedEmployee.avatar ? (
                            <img
                              src={badge.assignedEmployee.avatar}
                              alt={badge.assignedEmployee.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {badge.assignedEmployee.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {badge.assignedEmployee.id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBadge(badge)}
                    >
                      Ver
                    </Button>
                    
                    {canAssign(badge) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignBadge(badge)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Atribuir
                      </Button>
                    )}
                    
                    {canRevoke(badge) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeBadge(badge)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Revogar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {badge.notes && (
                  <div className="mt-3 pl-16">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Observações:</span> {badge.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((data.pagination.page - 1) * data.pagination.limit) + 1} a{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} de{' '}
            {data.pagination.total} crachás
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.pagination.page === data.pagination.pages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NFCBadgeCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedBadge && (
        <>
          <NFCBadgeAssignModal
            badge={selectedBadge}
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
          />

          <NFCBadgeRevokeModal
            isOpen={isRevokeModalOpen}
            onClose={() => setIsRevokeModalOpen(false)}
            badge={selectedBadge}
          />

          <NFCBadgeViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            badge={selectedBadge}
          />
        </>
      )}
    </div>
  );
} 