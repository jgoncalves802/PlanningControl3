'use client';

import { useState } from 'react';
import { Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NFCScanner from './NFCScanner';
import { useNFCScan } from '@/lib/useNFCBadges';

export default function NFCScanButton() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scanMutation = useNFCScan();

  const handleBadgeDetected = async (badgeId: string) => {
    try {
      await scanMutation.mutateAsync({ 
        badgeId,
        location: 'Scanner Web NFC'
      });
    } catch (error) {
      console.error('Erro ao processar crachá:', error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsScannerOpen(true)}
        className="flex items-center gap-2"
      >
        <Scan className="h-4 w-4" />
        Scan NFC
      </Button>

      <NFCScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBadgeDetected={handleBadgeDetected}
      />
    </>
  );
} 