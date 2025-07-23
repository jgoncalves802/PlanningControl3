import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar usuário atual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Por enquanto, usar um usuário mockado
        // Em produção, isso viria de uma API de autenticação
        const mockUser: User = {
          id: 'current',
          name: 'Usuário Atual',
          email: 'usuario@exemplo.com',
          role: 'admin',
        };
        
        setCurrentUser(mockUser);
      } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Buscar configurações do usuário
  const { data: settings, isLoading: isSettingsLoading, saveSettings } = useSettings(currentUser?.id || 'current');

  return {
    user: currentUser,
    settings,
    isLoading: isLoading || isSettingsLoading,
    saveSettings,
  };
} 