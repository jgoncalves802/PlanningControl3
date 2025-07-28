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

interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userCount: number;
  contractCount: number;
  createdAt: string;
  lastActivity: string;
}

interface CreateCompanyData {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 'emp1',
      name: 'Empresa 1 Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@empresa1.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      plan: 'PRO',
      status: 'ACTIVE',
      userCount: 25,
      contractCount: 8,
      createdAt: '2025-01-15T10:00:00Z',
      lastActivity: '2025-07-28T15:30:00Z'
    },
    {
      id: 'emp2',
      name: 'Empresa 2 Ltda',
      cnpj: '98.765.432/0001-10',
      email: 'contato@empresa2.com',
      phone: '(21) 88888-8888',
      address: 'Av. Principal, 456 - Rio de Janeiro/RJ',
      plan: 'BASIC',
      status: 'ACTIVE',
      userCount: 12,
      contractCount: 3,
      createdAt: '2025-02-20T14:00:00Z',
      lastActivity: '2025-07-28T12:15:00Z'
    },
    {
      id: 'emp3',
      name: 'Empresa 3 Ltda',
      cnpj: '55.444.333/0001-22',
      email: 'contato@empresa3.com',
      phone: '(31) 77777-7777',
      address: 'Rua do Comércio, 789 - Belo Horizonte/MG',
      plan: 'ENTERPRISE',
      status: 'SUSPENDED',
      userCount: 50,
      contractCount: 15,
      createdAt: '2025-03-10T09:00:00Z',
      lastActivity: '2025-07-25T18:45:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<CreateCompanyData>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    plan: 'BASIC'
  });

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return 'Básico';
      case 'PRO':
        return 'Profissional';
      case 'ENTERPRISE':
        return 'Empresarial';
      default:
        return 'Básico';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return 'secondary';
      case 'PRO':
        return 'default';
      case 'ENTERPRISE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'INACTIVE':
        return 'Inativa';
      case 'SUSPENDED':
        return 'Suspensa';
      default:
        return 'Ativa';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
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

      // Simular criação de empresa
      const createdCompany: Company = {
        id: Date.now().toString(),
        name: newCompany.name,
        cnpj: newCompany.cnpj,
        email: newCompany.email,
        phone: newCompany.phone,
        address: newCompany.address,
        plan: newCompany.plan,
        status: 'ACTIVE',
        userCount: 0,
        contractCount: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      setCompanies(prev => [createdCompany, ...prev]);
      setNewCompany({ name: '', cnpj: '', email: '', phone: '', address: '', plan: 'BASIC' });
      setIsCreateDialogOpen(false);
      toast.success('Empresa criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar empresa');
    }
  };

  const handleToggleCompanyStatus = (companyId: string) => {
    setCompanies(prev => prev.map(company => {
      if (company.id === companyId) {
        const newStatus = company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...company, status: newStatus };
      }
      return company;
    }));
    toast.success('Status da empresa atualizado');
  };

  const handleDeleteCompany = (companyId: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      toast.success('Empresa excluída com sucesso');
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

        {/* Lista de empresas */}
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
                    <Badge variant={getPlanBadgeVariant(company.plan)}>
                      {getPlanDisplayName(company.plan)}
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
                      {company.userCount} usuários
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {company.contractCount} contratos
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Última atividade: {new Date(company.lastActivity).toLocaleDateString('pt-BR')}
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

        {filteredCompanies.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 