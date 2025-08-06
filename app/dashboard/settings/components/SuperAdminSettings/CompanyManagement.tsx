'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Eye, Building, Users, Calendar, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCompanies, useCreateCompany, useDeleteCompany } from '@/lib/hooks/useSettings';
import { SubscriptionPlan, CompanyStatus } from '@prisma/client';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: any;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  timezone?: string;
  language?: string;
  subscriptionPlan: SubscriptionPlan;
  status: CompanyStatus;
  maxUsers: number;
  maxContracts: number;
  maxEmployees: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userRoles: number;
  };
}

interface CreateCompanyData {
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: any;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  timezone?: string;
  language?: string;
  subscriptionPlan: SubscriptionPlan;
  maxUsers?: number;
  maxContracts?: number;
  maxEmployees?: number;
}

export default function CompanyManagement() {
  const { data: companies = [], isLoading, error } = useCompanies();
  const createCompanyMutation = useCreateCompany();
  const deleteCompanyMutation = useDeleteCompany();

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<CreateCompanyData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: {},
    subscriptionPlan: 'BASIC',
    maxUsers: 10,
    maxContracts: 5,
    maxEmployees: 100
  });

  const getPlanDisplayName = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'BASIC':
        return 'Básico';
      case 'PROFESSIONAL':
        return 'Profissional';
      case 'ENTERPRISE':
        return 'Empresarial';
      default:
        return 'Básico';
    }
  };

  const getPlanBadgeVariant = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'BASIC':
        return 'secondary';
      case 'PROFESSIONAL':
        return 'default';
      case 'ENTERPRISE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusDisplayName = (status: CompanyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'SUSPENDED':
        return 'Suspensa';
      case 'PENDING':
        return 'Pendente';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Ativa';
    }
  };

  const getStatusBadgeVariant = (status: CompanyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = async () => {
    try {
      // Validação básica
      if (!newCompany.name || !newCompany.cnpj || !newCompany.email) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      await createCompanyMutation.mutateAsync(newCompany);
      setNewCompany({ 
        name: '', 
        cnpj: '', 
        email: '', 
        phone: '', 
        address: {}, 
        subscriptionPlan: 'BASIC',
        maxUsers: 10,
        maxContracts: 5,
        maxEmployees: 100
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleToggleCompanyStatus = async (companyId: string) => {
    try {
      const company = companies.find(c => c.id === companyId);
      if (!company) return;

      const newStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      // TODO: Implementar API para atualizar status
      toast.success('Status da empresa atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar status da empresa');
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      try {
        await deleteCompanyMutation.mutateAsync(companyId);
      } catch (error) {
        // Erro já tratado pelo hook
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Gerenciamento de Empresas
            </CardTitle>
            <CardDescription>
              Gerencie as empresas parceiras e suas configurações
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Empresa</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova empresa parceira
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome da empresa"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={newCompany.cnpj}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newCompany.address}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número - Cidade/UF"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan">Plano</Label>
                  <select
                    id="plan"
                    value={newCompany.plan}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, plan: e.target.value as 'BASIC' | 'PRO' | 'ENTERPRISE' }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="BASIC">Básico</option>
                    <option value="PRO">Profissional</option>
                    <option value="ENTERPRISE">Empresarial</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCompany}>
                  Criar Empresa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtro de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas por nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estados de loading e erro */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando empresas...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Erro ao carregar empresas: {error.message}</p>
          </div>
        )}

        {/* Lista de empresas */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredCompanies.map(company => (
            <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{company.name}</h3>
                    <Badge variant={getPlanBadgeVariant(company.subscriptionPlan)}>
                      {getPlanDisplayName(company.subscriptionPlan)}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(company.status)}>
                      {getStatusDisplayName(company.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{company.cnpj}</p>
                  <p className="text-sm text-muted-foreground">{company.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {company._count?.userRoles || 0} usuários
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {company.maxContracts} contratos máx.
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Última atividade: {new Date(company.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCompanyStatus(company.id)}
                >
                  {company.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCompany(company.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}

        {!isLoading && !error && filteredCompanies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 