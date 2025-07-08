'use client';

import { useState } from 'react';
import { Plus, Download, Upload, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, NFCBadgeFilters } from '@/lib/types/nfc-badges';
import { useNFCBadgesQuery, useDeleteNFCBadge, useNFCScan } from '@/lib/useNFCBadges';
import NFCBadgeStats from '@/components/nfc-badges/NFCBadgeStats';
import NFCBadgeFilters from '@/components/nfc-badges/NFCBadgeFilters';
import NFCBadgesList from '@/components/nfc-badges/NFCBadgesList';
import NFCBadgeModal from '@/components/nfc-badges/NFCBadgeModal';
import NFCBadgeViewModal from '@/components/nfc-badges/NFCBadgeViewModal';
import NFCBadgeAssignModal from '@/components/nfc-badges/NFCBadgeAssignModal';
import NFCBadgeRevokeModal from '@/components/nfc-badges/NFCBadgeRevokeModal';
import { toast } from 'react-hot-toast';

export default function NFCManagementPage() {
  const [filters, setFilters] = useState<NFCBadgeFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<NFCBadge | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { data: badgesData, isLoading } = useNFCBadgesQuery({
    ...filters,
    page: currentPage,
    limit: 20,
  });

  const deleteMutation = useDeleteNFCBadge();
  const scanMutation = useNFCScan();

  const badges = badgesData?.badges || [];
  const pagination = badgesData?.pagination;

  const handleView = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsViewModalOpen(true);
  };

  const handleEdit = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (badge: NFCBadge) => {
    if (window.confirm(`Tem certeza que deseja deletar o crachá ${badge.badgeId}?`)) {
      try {
        await deleteMutation.mutateAsync(badge.id);
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
  };

  const handleAssign = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsAssignModalOpen(true);
  };

  const handleRevoke = (badge: NFCBadge) => {
    setSelectedBadge(badge);
    setIsRevokeModalOpen(true);
  };

  const handleScanNFC = async () => {
    setIsScanning(true);
    try {
      // Simular leitura NFC - em produção, integrar com hardware NFC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar ID fictício para demonstração
      const mockId = Math.random().toString(16).substr(2, 12).toUpperCase();
      
      // Processar o scan
      await scanMutation.mutateAsync({ badgeId: mockId });
    } catch (error) {
      toast.error('Erro ao processar scan NFC');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = () => {
    // Implementar exportação de dados
    toast.success('Exportação iniciada');
  };

  const handleImport = () => {
    // Implementar importação de dados
    toast.success('Importação iniciada');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestão de Crachás NFC
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie crachás NFC e suas atribuições aos funcionários
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleScanNFC}
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                <Scan className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Lendo...' : 'Scan NFC'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={handleImport}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Crachá
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <NFCBadgeStats />

        {/* Filtros */}
        <NFCBadgeFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Lista de Crachás */}
        <NFCBadgesList
          badges={badges}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssign={handleAssign}
          onRevoke={handleRevoke}
        />

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <Card className="p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * pagination.limit) + 1} até {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} crachás
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modais */}
      <NFCBadgeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        badge={null}
      />

      <NFCBadgeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />

      <NFCBadgeViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />

      <NFCBadgeAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />

      <NFCBadgeRevokeModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setSelectedBadge(null);
        }}
        badge={selectedBadge}
      />
    </div>
  );
} 