'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Building, User, Settings } from 'lucide-react';

// Componentes Super Admin
import UserManagement from './components/SuperAdminSettings/UserManagement';
import CompanyManagement from './components/SuperAdminSettings/CompanyManagement';
import InfrastructureSettings from './components/SuperAdminSettings/InfrastructureSettings';

// Componentes Company Admin
import CompanyInfoSettings from './components/CompanyAdminSettings/CompanyInfoSettings';
import UserManagementSettings from './components/CompanyAdminSettings/UserManagementSettings';
import ContractSettings from './components/CompanyAdminSettings/ContractSettings';
import NotificationSettings from './components/CompanyAdminSettings/NotificationSettings';
import IntegrationSettings from './components/CompanyAdminSettings/IntegrationSettings';

// Componentes User
import PersonalSettings from './components/UserSettings/PersonalSettings';
import InterfaceSettings from './components/UserSettings/InterfaceSettings';
import UserNotificationSettings from './components/UserSettings/NotificationSettings';

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER'>('COMPANY_ADMIN');

  const getUserRole = () => {
    // Simular diferentes roles para teste
    // Em produção, isso viria do contexto de autenticação
    return userRole;
  };

  const renderSuperAdminSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">Configurações Super Admin</h1>
        <Badge variant="destructive">Super Administrador</Badge>
      </div>
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Empresas
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Infraestrutura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="companies">
          <CompanyManagement />
        </TabsContent>

        <TabsContent value="infrastructure">
          <InfrastructureSettings />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCompanyAdminSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Configurações da Empresa</h1>
        <Badge variant="default">Administrador da Empresa</Badge>
      </div>
      
      <Tabs defaultValue="company-info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company-info" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Informações da Empresa
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuários e Permissões
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Contratos e Funções
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company-info">
          <CompanyInfoSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementSettings />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Configurações Pessoais</h1>
        <Badge variant="secondary">Usuário</Badge>
      </div>
      
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Pessoal
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalSettings />
        </TabsContent>

        <TabsContent value="interface">
          <InterfaceSettings />
        </TabsContent>

        <TabsContent value="notifications">
          <UserNotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    const role = getUserRole();
    
    switch (role) {
      case 'SUPER_ADMIN':
        return renderSuperAdminSettings();
      case 'COMPANY_ADMIN':
        return renderCompanyAdminSettings();
      case 'USER':
        return renderUserSettings();
      default:
        return renderUserSettings();
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Seletor de Role para Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Seletor de Role (Apenas para Teste)</CardTitle>
          <CardDescription>
            Selecione o nível de acesso para testar as diferentes interfaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <button
              onClick={() => setUserRole('SUPER_ADMIN')}
              className={`px-4 py-2 rounded-lg border ${
                userRole === 'SUPER_ADMIN' 
                  ? 'bg-red-100 border-red-300 text-red-700' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Super Admin
            </button>
            <button
              onClick={() => setUserRole('COMPANY_ADMIN')}
              className={`px-4 py-2 rounded-lg border ${
                userRole === 'COMPANY_ADMIN' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              Company Admin
            </button>
            <button
              onClick={() => setUserRole('USER')}
              className={`px-4 py-2 rounded-lg border ${
                userRole === 'USER' 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              User
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      {renderContent()}
    </div>
  );
} 