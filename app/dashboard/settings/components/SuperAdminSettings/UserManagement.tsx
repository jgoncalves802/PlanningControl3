'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Edit, Trash2, Eye, Shield, Building, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/useSuperAdminSettings';

interface CreateUserData {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  password: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'USER',
    password: ''
  });

  // Hooks para gerenciar dados
  const { data: usersData, isLoading: loadingUsers } = useUsers({
    search: searchTerm || undefined,
    limit: 50
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];

  const [companies] = useState([
    { id: 'emp1', name: 'Empresa 1 Ltda' },
    { id: 'emp2', name: 'Empresa 2 Ltda' },
    { id: 'emp3', name: 'Empresa 3 Ltda' }
  ]);

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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'COMPANY_ADMIN':
        return 'Admin Empresa';
      case 'USER':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'destructive';
      case 'COMPANY_ADMIN':
        return 'default';
      case 'USER':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validação básica
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (newUser.role === 'COMPANY_ADMIN' && !newUser.companyId) {
        toast.error('Selecione uma empresa para administradores de empresa');
        return;
      }

      await createUserMutation.mutateAsync(newUser);
      setNewUser({ name: '', email: '', role: 'USER', password: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { isActive: !currentStatus }
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  if (loadingUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando usuários...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Crie e gerencie usuários do sistema com diferentes níveis de acesso
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo usuário no sistema
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Digite o email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Digite a senha"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Nível de Acesso *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER') =>
                      setNewUser(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Super Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPANY_ADMIN">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Administrador da Empresa
                        </div>
                      </SelectItem>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Usuário
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newUser.role === 'COMPANY_ADMIN' && (
                  <div className="grid gap-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select
                      value={newUser.companyId}
                      onValueChange={(value) =>
                        setNewUser(prev => ({ ...prev, companyId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Criando...
                    </>
                  ) : (
                    'Criar Usuário'
                  )}
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
              placeholder="Buscar usuários por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de usuários */}
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.name}</h3>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.companyName && (
                    <p className="text-sm text-muted-foreground">Empresa: {user.companyName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    {user.lastLogin && ` • Último login: ${new Date(user.lastLogin).toLocaleDateString('pt-BR')}`}
                  </p>
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
                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                  disabled={updateUserMutation.isPending}
                >
                  {user.isActive ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-destructive hover:text-destructive"
                  disabled={deleteUserMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && !loadingUsers && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 