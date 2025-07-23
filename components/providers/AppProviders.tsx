"use client";

import React, { ReactNode } from 'react';
import ThemeProvider from '@/lib/providers/ThemeProvider';
import LanguageProvider from '@/lib/providers/LanguageProvider';
import { AppSettingsProvider } from '@/lib/contexts/AppSettingsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppSettingsProvider>
          {children}
        </AppSettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
} 