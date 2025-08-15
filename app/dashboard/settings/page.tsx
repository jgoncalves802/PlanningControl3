'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Building, User, Settings, Key } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { validateUserAccess } from '@/lib/auth-client';

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

// Componente de Gerenciamento de Permissões
import UserPermissionsManager from '@/components/settings/UserPermissionsManager';

export default function SettingsPage() {
  const { user, loading } = useCurrentUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Acesso negado. Faça login para continuar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderSuperAdminSettings = () => (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold">Configurações Super Admin</h1>
          <Badge variant="destructive">Super Administrador</Badge>
        </div>
      
              <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Permissões
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
          <UserManagement onUserSelected={setSelectedUserId} />
        </TabsContent>

        <TabsContent value="permissions">
          {selectedUserId ? (
            <UserPermissionsManager 
              userId={selectedUserId}
              userName="Usuário Selecionado"
              userRole="USER"
              onPermissionsUpdated={() => {
                // Recarregar dados se necessário
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gerenciar Permissões</h3>
                  <p className="text-gray-600">
                    Selecione um usuário na aba "Usuários" para configurar suas permissões granulares.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
            Usuários da Empresa
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissões
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
          <UserManagementSettings onUserSelected={setSelectedUserId} />
        </TabsContent>

        <TabsContent value="permissions">
          {selectedUserId ? (
            <UserPermissionsManager 
              userId={selectedUserId}
              userName="Usuário Selecionado"
              userRole="USER"
              onPermissionsUpdated={() => {
                // Recarregar dados se necessário
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gerenciar Permissões</h3>
                  <p className="text-gray-600">
                    Selecione um usuário da sua empresa na aba "Usuários da Empresa" para configurar suas permissões.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
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
    // Verificar se o usuário tem acesso às configurações
    if (!validateUserAccess(user, 'USER')) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
              <p className="text-gray-600">
                Você não tem permissão para acessar as configurações.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    switch (user.role) {
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
      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>
            Dados do usuário logado e suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome</label>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nível de Acesso</label>
              <Badge variant={
                user.role === 'SUPER_ADMIN' ? 'destructive' :
                user.role === 'COMPANY_ADMIN' ? 'default' : 'secondary'
              }>
                {user.role}
              </Badge>
            </div>
          </div>
          {user.companyId && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600">Empresa</label>
              <p className="text-lg">ID: {user.companyId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      {renderContent()}
    </div>
  );
} 