'use client'

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Building, Shield } from 'lucide-react';
import PersonalSettings from './components/UserSettings/PersonalSettings';
import InterfaceSettings from './components/UserSettings/InterfaceSettings';
import NotificationSettings from './components/UserSettings/NotificationSettings';
import AppProviders from '@/components/providers/AppProviders';

// Mock de permissões - em produção viria do sistema de auth
const getUserRole = () => {
  // Por enquanto, vamos simular que é um usuário comum
  return 'USER';
};

const getUserPermissions = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return ['super-admin', 'company-admin', 'user'];
    case 'COMPANY_ADMIN':
      return ['company-admin', 'user'];
    case 'USER':
    default:
      return ['user'];
  }
};

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<string>('USER');
  const [permissions, setPermissions] = useState<string[]>(['user']);

  useEffect(() => {
    const role = getUserRole();
    const userPermissions = getUserPermissions(role);
    setUserRole(role);
    setPermissions(userPermissions);
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'COMPANY_ADMIN':
        return 'Administrador da Empresa';
      case 'USER':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'COMPANY_ADMIN':
        return <Building className="h-4 w-4" />;
      case 'USER':
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <AppProviders>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do sistema de acordo com seu nível de acesso
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getRoleIcon(userRole)}
              {getRoleDisplayName(userRole)}
            </Badge>
          </div>
        </div>

        {/* Tabs de Configurações */}
        <Tabs defaultValue="user" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            {permissions.includes('super-admin') && (
              <TabsTrigger value="super-admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Super Admin
              </TabsTrigger>
            )}
            {permissions.includes('company-admin') && (
              <TabsTrigger value="company-admin" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Empresa
              </TabsTrigger>
            )}
            {permissions.includes('user') && (
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuário
              </TabsTrigger>
            )}
          </TabsList>

          {/* Conteúdo das Tabs */}
          {permissions.includes('user') && (
            <TabsContent value="user" className="space-y-6">
              <PersonalSettings />
              <InterfaceSettings />
              <NotificationSettings />
            </TabsContent>
          )}

          {permissions.includes('company-admin') && (
            <TabsContent value="company-admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Configurações da Empresa
                  </CardTitle>
                  <CardDescription>
                    Gerencie as configurações da sua empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configurações de empresa serão implementadas em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {permissions.includes('super-admin') && (
            <TabsContent value="super-admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configurações Super Admin
                  </CardTitle>
                  <CardDescription>
                    Gerencie as configurações globais do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configurações de super admin serão implementadas em breve.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppProviders>
  );
} 