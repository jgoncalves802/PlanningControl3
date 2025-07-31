'use client';

import React, { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, type User } from '@/lib/hooks/useUsers';
import { useUserPermissions, useAddContractPermission, useRemoveContractPermission } from '@/lib/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Calendar,
  Shield,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface UserFormData {
  name: string;
  email: string;
  clerkId?: string;
}

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    clerkId: ''
  });

  // Queries e mutations
  const { data: usersData, isLoading, error, refetch } = useUsers(page, 10, search, role, status);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const addPermissionMutation = useAddContractPermission();
  const removePermissionMutation = useRemoveContractPermission();

  // Buscar permissões do usuário selecionado
  const { data: permissionsData } = useUserPermissions(selectedUser?.id || '');

  const handleCreateUser = async () => {
    try {
      // Remover clerkId se estiver vazio
      const dataToSend = {
        name: formData.name,
        email: formData.email,
        ...(formData.clerkId && { clerkId: formData.clerkId })
      };

      await createUserMutation.mutateAsync(dataToSend);
      toast.success('Usuário criado com sucesso!');
      setIsCreateDialogOpen(false);
      setFormData({ name: '', email: '', clerkId: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Remover clerkId se estiver vazio
      const dataToSend = {
        id: selectedUser.id,
        name: formData.name,
        email: formData.email,
        ...(formData.clerkId && { clerkId: formData.clerkId })
      };

      await updateUserMutation.mutateAsync(dataToSend);
      toast.success('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', clerkId: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${user.name}"?`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success('Usuário deletado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar usuário');
    }
  };

  const handleTogglePermission = async (contractId: string, hasPermission: boolean) => {
    if (!selectedUser) return;

    try {
      if (hasPermission) {
        await removePermissionMutation.mutateAsync({
          userId: selectedUser.id,
          contractId
        });
        toast.success('Permissão removida com sucesso!');
      } else {
        await addPermissionMutation.mutateAsync({
          userId: selectedUser.id,
          contractId
        });
        toast.success('Permissão adicionada com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar permissão');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      clerkId: user.clerkId || ''
    });
    setIsEditDialogOpen(true);
  };

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Erro ao carregar usuários
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {error.message}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {usersData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Usuários
                  </p>
                  <p className="text-2xl font-bold">{usersData.stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Usuários Ativos
                  </p>
                  <p className="text-2xl font-bold">{usersData.stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Usuários Inativos
                  </p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Novos (30 dias)
                  </p>
                  <p className="text-2xl font-bold">{usersData.stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gerenciamento de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Gerenciamento de Usuários</span>
          </CardTitle>
          <CardDescription>
            Crie e gerencie usuários do sistema com diferentes níveis de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuários por nome, email ou empresa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as funções" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as funções</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          {/* Lista de Usuários */}
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : usersData ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {usersData.pagination.total} usuário(s) • Página {usersData.pagination.page} de {usersData.pagination.totalPages}
              </div>
              
              {usersData.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <input type="checkbox" className="rounded" />
                    <Avatar>
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{user.name || 'Sem nome'}</h3>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Usuário</span>
                        </Badge>
                        <Badge variant="default" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Ativo</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {user.clerkId && (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>Clerk ID: {user.clerkId}</span>
                          </div>
                        )}
                        {user.contractResponsibilities.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{user.contractResponsibilities.length} contrato(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPermissionsDialog(user)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Dialog de Criar Usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="clerkId">Clerk ID (Opcional)</Label>
              <Input
                id="clerkId"
                value={formData.clerkId}
                onChange={(e) => setFormData({ ...formData, clerkId: e.target.value })}
                placeholder="ID do Clerk (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                O Clerk ID é opcional e pode ser adicionado posteriormente.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending || !formData.name || !formData.email}
            >
              {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-clerkId">Clerk ID (Opcional)</Label>
              <Input
                id="edit-clerkId"
                value={formData.clerkId}
                onChange={(e) => setFormData({ ...formData, clerkId: e.target.value })}
                placeholder="ID do Clerk (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                O Clerk ID é opcional e pode ser adicionado posteriormente.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending || !formData.name || !formData.email}
            >
              {updateUserMutation.isPending ? 'Atualizando...' : 'Atualizar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Permissões */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Permissões de Contratos</DialogTitle>
            <DialogDescription>
              Gerencie as permissões de contratos para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {permissionsData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Contratos</p>
                  <p className="text-2xl font-bold">{permissionsData.stats.totalContracts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratos Atribuídos</p>
                  <p className="text-2xl font-bold">{permissionsData.stats.assignedContracts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratos Disponíveis</p>
                  <p className="text-2xl font-bold">{permissionsData.stats.totalContracts - permissionsData.stats.assignedContracts}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {permissionsData.permissions.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{contract.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{contract.code}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={contract.hasPermission}
                        onCheckedChange={() => handleTogglePermission(contract.id, contract.hasPermission)}
                        disabled={addPermissionMutation.isPending || removePermissionMutation.isPending}
                      />
                      <span className="text-sm">
                        {contract.hasPermission ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 