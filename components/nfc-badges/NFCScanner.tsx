'use client';

import { useState, useEffect } from 'react';
import { Scan, Smartphone, Wifi, WifiOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NFCReadResult {
  success: boolean;
  badgeId?: string;
  serialNumber?: string;
  error?: string;
}

interface NFCScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBadgeDetected?: (badgeId: string) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

export default function NFCScanner({ isOpen, onClose, onBadgeDetected, onError, autoStart = false }: NFCScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<NFCReadResult | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);

  useEffect(() => {
    // Verificar suporte ao NFC
    const checkNFCSupport = () => {
      const isSecure = window.isSecureContext;
      const isChrome = /Chrome/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const hasNDEF = 'NDEFReader' in window;
      
      const supported = isSecure && isChrome && isAndroid && hasNDEF;
      setNfcSupported(supported);
      
      if (!supported) {
        let reason = 'NFC não suportado';
        if (!isSecure) reason = 'HTTPS é necessário para usar NFC';
        else if (!isChrome) reason = 'Use o navegador Chrome';
        else if (!isAndroid) reason = 'Funciona apenas no Android';
        else if (!hasNDEF) reason = 'Web NFC API não disponível';
        
        setScanResult({ success: false, error: reason });
      }
    };

    checkNFCSupport();
  }, []);

  // Auto-start scanning when modal opens
  useEffect(() => {
    if (isOpen && autoStart && nfcSupported && !isScanning && !scanResult) {
      handleStartScan();
    }
  }, [isOpen, autoStart, nfcSupported]);

  const handleStartScan = async () => {
    if (!nfcSupported) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      // @ts-ignore - Web NFC API
      const ndef = new NDEFReader();
      
      // Timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        const errorMsg = 'Timeout: Nenhum crachá detectado em 30 segundos';
        setScanResult({
          success: false,
          error: errorMsg
        });
        setIsScanning(false);
        if (onError) {
          onError(errorMsg);
        }
      }, 30000);

      // Listener para leitura
      ndef.addEventListener('reading', (event: any) => {
        clearTimeout(timeoutId);
        controller.abort();
        
        const badgeId = event.serialNumber || Date.now().toString(16).toUpperCase();
        
        setScanResult({
          success: true,
          badgeId,
          serialNumber: event.serialNumber
        });
        
        if (onBadgeDetected) {
          onBadgeDetected(badgeId);
        }
        
        setIsScanning(false);
      });

      // Listener para erros
      ndef.addEventListener('readingerror', () => {
        clearTimeout(timeoutId);
        const errorMsg = 'Erro ao ler crachá NFC';
        setScanResult({
          success: false,
          error: errorMsg
        });
        setIsScanning(false);
        if (onError) {
          onError(errorMsg);
        }
      });

      // Iniciar escaneamento
      await ndef.scan({ signal: controller.signal });
      
    } catch (error: any) {
      setIsScanning(false);
      
      let errorMessage = 'Erro desconhecido';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão NFC negada. Ative o NFC nas configurações.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'NFC não suportado neste dispositivo';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'NFC não está disponível';
      }

      setScanResult({
        success: false,
        error: errorMessage
      });
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScanResult(null);
  };

  const handleClose = () => {
    if (isScanning) {
      handleStopScan();
    }
    onClose();
  };

  return (
    <div className={isOpen ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" : "hidden"}>
      <Card className="w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Scan className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Scanner NFC</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status do NFC */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {nfcSupported ? (
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <WifiOff className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-2">
              {nfcSupported ? 'NFC Disponível' : 'NFC Indisponível'}
            </h3>
            
            {!nfcSupported && scanResult?.error && (
              <p className="text-sm text-red-600 mb-4">{scanResult.error}</p>
            )}
          </div>

          {/* Instruções */}
          {nfcSupported && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Como usar:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ative o NFC nas configurações do Android</li>
                    <li>• Clique em "Iniciar Escaneamento"</li>
                    <li>• Aproxime o crachá da parte traseira do celular</li>
                    <li>• Aguarde a detecção automática</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Resultado do Scan */}
          {scanResult && (
            <div className={`p-4 rounded-lg ${
              scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${
                    scanResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {scanResult.success ? 'Crachá Detectado!' : 'Erro no Escaneamento'}
                  </h4>
                  
                  {scanResult.success ? (
                    <div className="space-y-1">
                      <p className="text-sm text-green-700">
                        <strong>ID:</strong> {scanResult.badgeId}
                      </p>
                      {scanResult.serialNumber && (
                        <p className="text-sm text-green-700">
                          <strong>Serial:</strong> {scanResult.serialNumber}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-700">{scanResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            {nfcSupported && !isScanning && !scanResult?.success && (
              <Button
                onClick={handleStartScan}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Scan className="h-4 w-4 mr-2" />
                Iniciar Escaneamento
              </Button>
            )}

            {isScanning && (
              <Button
                onClick={handleStopScan}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Parar Escaneamento
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isScanning}
            >
              {scanResult?.success ? 'Concluir' : 'Fechar'}
            </Button>
          </div>

          {/* Status de Escaneamento */}
          {isScanning && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Aguardando crachá NFC...</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Aproxime o crachá da parte traseira do celular
              </p>
            </div>
          )}

          {/* Avisos importantes */}
          {nfcSupported && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>⚠️ Funciona apenas no Chrome para Android</p>
              <p>🔒 Requer conexão HTTPS segura</p>
              <p>📱 NFC deve estar ativado no dispositivo</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 
