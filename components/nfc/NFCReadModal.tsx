import NFCScanner from '@/components/nfc-badges/NFCScanner';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import React from 'react';

interface NFCReadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBadgeDetected: (badgeId: string) => void;
  title?: string;
  description?: string;
}

export default function NFCReadModal({ isOpen, onClose, onBadgeDetected, title, description }: NFCReadModalProps) {
  // Não faça return null condicional
  return (
    <div className={isOpen ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" : "hidden"}>
      <Card className="w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {title || 'Leitura NFC'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          {description && <p className="text-gray-600 mb-4 text-center">{description}</p>}
          <NFCScanner
            isOpen={isOpen}
            onClose={onClose}
            onBadgeDetected={onBadgeDetected}
            autoStart={true}
          />
        </div>
      </Card>
    </div>
  );
} 
