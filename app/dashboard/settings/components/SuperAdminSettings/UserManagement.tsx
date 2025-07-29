'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Building, 
  User, 
  Loader2, 
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/useSuperAdminSettings';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  companyName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  password: string;
  confirmPassword: string;
}

interface EditUserData {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
  companyId?: string;
  isActive: boolean;
}

export default function UserManagement() {
  // Estados principais
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados de modais
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);
  
  // Estados de dados
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    confirmPassword: ''
  });
  
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Hooks para gerenciar dados
  const { data: usersData, isLoading: loadingUsers, refetch } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    role: selectedRole !== 'all' ? selectedRole : undefined,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Dados mock para empresas (em produção viria da API)
  const [companies] = useState([
    { id: 'emp1', name: 'Empresa 1 Ltda', cnpj: '12.345.678/0001-90' },
    { id: 'emp2', name: 'Empresa 2 Ltda', cnpj: '98.765.432/0001-10' },
    { id: 'emp3', name: 'Empresa 3 Ltda', cnpj: '11.222.333/0001-44' }
  ]);

  // Funções auxiliares
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

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  // Handlers
  const handleCreateUser = async () => {
    try {
      // Validação
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (newUser.password !== newUser.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      if (newUser.password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      if (newUser.role === 'COMPANY_ADMIN' && !newUser.companyId) {
        toast.error('Selecione uma empresa para administradores de empresa');
        return;
      }

      await createUserMutation.mutateAsync(newUser);
      
      // Limpar formulário
      setNewUser({
        name: '',
        email: '',
        role: 'USER',
        password: '',
        confirmPassword: ''
      });
      setIsCreateDialogOpen(false);
      toast.success('Usuário criado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data: editingUser
      });
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast.success('Usuário atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar usuário');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: { isActive: !currentStatus }
      });
      toast.success(`Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar status do usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        toast.success('Usuário excluído com sucesso!');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)? Esta ação não pode ser desfeita.`)) {
      try {
        await Promise.all(selectedUsers.map(id => deleteUserMutation.mutateAsync(id)));
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} usuário(s) excluído(s) com sucesso!`);
      } catch (error: any) {
        toast.error('Erro ao excluir usuários');
      }
    }
  };

  const handleBulkToggleStatus = async (activate: boolean) => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    try {
      await Promise.all(selectedUsers.map(id => 
        updateUserMutation.mutateAsync({
          id,
          data: { isActive: activate }
        })
      ));
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} usuário(s) ${activate ? 'ativado(s)' : 'desativado(s)'} com sucesso!`);
    } catch (error: any) {
      toast.error('Erro ao alterar status dos usuários');
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openEditDialog = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  // Filtros aplicados
  const filteredUsers = users;

  if (loadingUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{pagination?.total || 0}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Inativos</p>
                <p className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos (30 dias)</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => {
                    const createdAt = new Date(u.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdAt > thirtyDaysAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card principal */}
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={loadingUsers}
              >
                <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </Button>
              
              {selectedUsers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkActionsOpen(true)}
                >
                  Ações em Massa ({selectedUsers.length})
                </Button>
              )}
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                      Preencha os dados para criar um novo usuário no sistema
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                      <TabsTrigger value="advanced">Configurações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
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
                          <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirme a senha"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="grid gap-4">
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
                    </TabsContent>
                  </Tabs>
                  
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
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar usuários por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="COMPANY_ADMIN">Admin Empresa</SelectItem>
                  <SelectItem value="USER">Usuário</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de usuários */}
          <div className="space-y-4">
            {/* Header da tabela */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  {selectedUsers.length > 0 
                    ? `${selectedUsers.length} de ${users.length} selecionado(s)`
                    : `${users.length} usuário(s)`
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Página {currentPage} de {pagination?.pages || 1}</span>
                <span>•</span>
                <span>{pagination?.total || 0} total</span>
              </div>
            </div>

            {/* Usuários */}
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded"
                  />
                  
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
                      <div className="flex items-center gap-1">
                        {getStatusIcon(user.isActive)}
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      
                      {user.companyName && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {user.companyName}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      
                      {user.lastLogin && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
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

          {filteredUsers.length === 0 && !loadingUsers && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar os filtros ou criar um novo usuário
              </p>
            </div>
          )}

          {/* Paginação */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} usuários
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <span className="text-sm">
                  Página {currentPage} de {pagination.pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Nível de Acesso</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER') =>
                    setEditingUser(prev => prev ? { ...prev, role: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Administrador</SelectItem>
                    <SelectItem value="COMPANY_ADMIN">Administrador da Empresa</SelectItem>
                    <SelectItem value="USER">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editingUser.role === 'COMPANY_ADMIN' && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Select
                    value={editingUser.companyId}
                    onValueChange={(value) =>
                      setEditingUser(prev => prev ? { ...prev, companyId: value } : null)
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
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                  className="rounded"
                />
                <Label htmlFor="edit-active">Usuário ativo</Label>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
            <DialogDescription>
              Informações completas do usuário
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)} className="flex items-center gap-1">
                      {getRoleIcon(selectedUser.role)}
                      {getRoleDisplayName(selectedUser.role)}
                    </Badge>
                    <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                      {selectedUser.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono">{selectedUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedUser.email}</span>
                    </div>
                    {selectedUser.companyName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa:</span>
                        <span>{selectedUser.companyName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Datas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span>{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Último login:</span>
                        <span>{new Date(selectedUser.lastLogin).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Ações em Massa */}
      <Dialog open={isBulkActionsOpen} onOpenChange={setIsBulkActionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ações em Massa</DialogTitle>
            <DialogDescription>
              Aplicar ações a {selectedUsers.length} usuário(s) selecionado(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  handleBulkToggleStatus(true);
                  setIsBulkActionsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Ativar Todos
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  handleBulkToggleStatus(false);
                  setIsBulkActionsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Desativar Todos
              </Button>
            </div>
            
            <Button
              variant="destructive"
              onClick={() => {
                handleBulkDelete();
                setIsBulkActionsOpen(false);
              }}
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Todos ({selectedUsers.length})
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsBulkActionsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 