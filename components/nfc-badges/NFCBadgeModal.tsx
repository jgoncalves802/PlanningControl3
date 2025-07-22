'use client';

import { useState, useEffect } from 'react';
import { X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NFCBadge, CreateNFCBadgeData, UpdateNFCBadgeData, validateNFCBadgeId } from '@/lib/types/nfc-badges';
import { useCreateNFCBadge, useUpdateNFCBadge } from '@/lib/useNFCBadges';

interface NFCBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge?: NFCBadge | null;
}

export default function NFCBadgeModal({ isOpen, onClose, badge }: NFCBadgeModalProps) {
  const [formData, setFormData] = useState({
    badgeId: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);

  const createMutation = useCreateNFCBadge();
  const updateMutation = useUpdateNFCBadge();

  const isEditing = !!badge;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      if (badge) {
        setFormData({
          badgeId: badge.badgeId,
          notes: badge.notes || '',
        });
      } else {
        setFormData({
          badgeId: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, badge]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.badgeId.trim()) {
      newErrors.badgeId = 'ID do crachá é obrigatório';
    } else if (!validateNFCBadgeId(formData.badgeId)) {
      newErrors.badgeId = 'ID do crachá deve ser um valor hexadecimal válido (8-16 caracteres)';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Observações devem ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isEditing && badge) {
        const updateData: UpdateNFCBadgeData = {
          badgeId: formData.badgeId,
          notes: formData.notes || undefined,
        };
        await updateMutation.mutateAsync({ id: badge.id, data: updateData });
      } else {
        const createData: CreateNFCBadgeData = {
          badgeId: formData.badgeId,
          notes: formData.notes || undefined,
        };
        await createMutation.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      // Erro já tratado pelos hooks
    }
  };

  const handleScanNFC = async () => {
    setIsScanning(true);
    try {
      // Simular leitura NFC - em produção, integrar com hardware NFC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar ID fictício para demonstração
      const mockId = Math.random().toString(16).substr(2, 12).toUpperCase();
      setFormData(prev => ({ ...prev, badgeId: mockId }));
    } catch (error) {
      console.error('Erro ao ler NFC:', error);
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Crachá' : 'Novo Crachá'}
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
          {/* ID do Crachá */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID do Crachá *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: A1B2C3D4"
                value={formData.badgeId}
                onChange={(e) => setFormData(prev => ({ ...prev, badgeId: e.target.value.toUpperCase() }))}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.badgeId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleScanNFC}
                disabled={isScanning || isLoading}
                className="flex items-center gap-2"
              >
                <Scan className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Lendo...' : 'Scan'}
              </Button>
            </div>
            {errors.badgeId && (
              <p className="text-red-500 text-sm mt-1">{errors.badgeId}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Formato: 8-16 caracteres hexadecimais (0-9, A-F)
            </p>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              placeholder="Observações sobre o crachá..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              {formData.notes.length}/500 caracteres
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
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
