import { prisma } from '@/lib/prisma';

export async function initializeAppSettings(userId: string) {
  try {
    // Buscar configurações do usuário
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      include: {
        personalSettings: true,
        interfaceSettings: true,
        notificationSettings: true,
      },
    });

    if (userSettings?.personalSettings) {
      const { theme, language, timezone } = userSettings.personalSettings;
      
      // Aplicar tema
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
        
        // Aplicar idioma
        document.documentElement.lang = language;
        localStorage.setItem('app-language', language);
        localStorage.setItem('theme', theme);
        
        // Disparar eventos
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar configurações:', error);
  }
}

export function loadSettingsFromStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Carregar tema
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(savedTheme);
      }
    }
    
    // Carregar idioma
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage) {
      document.documentElement.lang = savedLanguage;
    }
  } catch (error) {
    console.error('Erro ao carregar configurações do storage:', error);
  }
} 