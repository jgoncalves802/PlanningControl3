'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OfflineContextType {
  isOfflineMode: boolean;
  isConnected: boolean;
  toggleOfflineMode: () => void;
  forceOnlineMode: () => void;
  forceOfflineMode: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Verificar conexão inicial
    setIsConnected(navigator.onLine);

    // Listeners para mudanças de conexão
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  const forceOnlineMode = () => {
    setIsOfflineMode(false);
  };

  const forceOfflineMode = () => {
    setIsOfflineMode(true);
  };

  return (
    <OfflineContext.Provider value={{
      isOfflineMode,
      isConnected,
      toggleOfflineMode,
      forceOnlineMode,
      forceOfflineMode,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
} 