"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções básicas
const translations = {
  'pt-BR': {
    'settings.personal': 'Configurações Pessoais',
    'settings.interface': 'Configurações de Interface',
    'settings.notifications': 'Configurações de Notificações',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'loading': 'Carregando...',
    'error': 'Erro',
    'success': 'Sucesso',
    'name': 'Nome',
    'email': 'E-mail',
    'phone': 'Telefone',
    'language': 'Idioma',
    'theme': 'Tema',
    'timezone': 'Fuso Horário',
  },
  'en-US': {
    'settings.personal': 'Personal Settings',
    'settings.interface': 'Interface Settings',
    'settings.notifications': 'Notification Settings',
    'save': 'Save',
    'cancel': 'Cancel',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'name': 'Name',
    'email': 'Email',
    'phone': 'Phone',
    'language': 'Language',
    'theme': 'Theme',
    'timezone': 'Time Zone',
  },
  'es-ES': {
    'settings.personal': 'Configuraciones Personales',
    'settings.interface': 'Configuraciones de Interfaz',
    'settings.notifications': 'Configuraciones de Notificaciones',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'name': 'Nombre',
    'email': 'Correo',
    'phone': 'Teléfono',
    'language': 'Idioma',
    'theme': 'Tema',
    'timezone': 'Zona Horaria',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt-BR');

  useEffect(() => {
    // Carregar idioma do localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Aplicar idioma
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
    
    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}

export default LanguageProvider; 