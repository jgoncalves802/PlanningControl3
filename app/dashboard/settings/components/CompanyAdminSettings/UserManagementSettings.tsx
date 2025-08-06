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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Eye, Shield, User, Users, Building, Loader2, Filter, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  department: string;
  position: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

interface Department {
  id: string;
  name: string;
  managerId?: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  userCount: number;
}

interface UserManagementSettingsProps {
  onUserSelected?: (userId: string) => void;
}

export default function UserManagementSettings({ onUserSelected }: UserManagementSettingsProps) {
  const [users, setUsers] = useState<CompanyUser[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      role: 'ADMIN',
      department: 'Administração',
      position: 'Gerente Administrativo',
      isActive: true,
      lastLogin: '2025-07-28T15:30:00Z',
      createdAt: '2025-01-15T10:00:00Z',
      avatar: ''
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      role: 'MANAGER',
      department: 'Recursos Humanos',
      position: 'Coordenadora de RH',
      isActive: true,
      lastLogin: '2025-07-28T14:20:00Z',
      createdAt: '2025-02-20T09:00:00Z',
      avatar: ''
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      role: 'USER',
      department: 'Operações',
      position: 'Operador',
      isActive: true,
      lastLogin: '2025-07-28T13:45:00Z',
      createdAt: '2025-03-10T11:00:00Z',
      avatar: ''
    }
  ]);

  const [departments] = useState<Department[]>([
    { id: '1', name: 'Administração', managerId: '1', userCount: 3 },
    { id: '2', name: 'Recursos Humanos', managerId: '2', userCount: 2 },
    { id: '3', name: 'Operações', userCount: 5 },
    { id: '4', name: 'Financeiro', userCount: 2 },
    { id: '5', name: 'Comercial', userCount: 3 }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrador',
      permissions: ['all'],
      userCount: 1
    },
    {
      id: '2',
      name: 'Gerente',
      permissions: ['read', 'write', 'delete'],
      userCount: 2
    },
    {
      id: '3',
      name: 'Usuário',
      permissions: ['read'],
      userCount: 8
    }
  ]);

  // Estados de interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CompanyUser | null>(null);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Função para selecionar usuário para gerenciamento de permissões
  const handleSelectUserForPermissions = (user: CompanyUser) => {
    if (onUserSelected) {
      onUserSelected(user.id);
      toast.success(`Usuário "${user.name}" selecionado para gerenciamento de permissões`);
    }
  };

  // Funções auxiliares
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'MANAGER':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'USER':
        return <User className="h-4 w-4 text-green-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'USER':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'secondary' as const;
      case 'MANAGER':
        return 'default' as const;
      case 'USER':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || !selectedDepartment || user.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const handleCreateUser = async (userData: Partial<CompanyUser>) => {
    setIsLoading(true);
    try {
      // Simular criação de usuário
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: CompanyUser = {
        id: Date.now().toString(),
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'USER',
        department: userData.department || '',
        position: userData.position || '',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setUsers(prev => [newUser, ...prev]);
      setIsCreateDialogOpen(false);
      toast.success('Usuário criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    toast.success('Status do usuário atualizado');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Usuário excluído com sucesso');
    }
  };

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuários
        </TabsTrigger>
        <TabsTrigger value="departments" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Departamentos
        </TabsTrigger>
        <TabsTrigger value="roles" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Funções
        </TabsTrigger>
      </TabsList>

      {/* Aba de Usuários */}
      <TabsContent value="users" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários da sua empresa e suas permissões
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
                      Adicione um novo usuário à empresa
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm onSubmit={handleCreateUser} isLoading={isLoading} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Departamento" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os departamentos</SelectItem>
                                {departments.map(dept => (
                                  <SelectItem key={dept.id} value={dept.name}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Função" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas as funções</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="MANAGER">Gerente</SelectItem>
                                <SelectItem value="USER">Usuário</SelectItem>
                              </SelectContent>
                            </Select>
              </div>
            </div>

            {/* Lista de usuários */}
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
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
                      <p className="text-sm text-muted-foreground">
                        {user.position} • {user.department}
                      </p>
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

                    {/* Botão de Gerenciar Permissões */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectUserForPermissions(user)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Key className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id)}
                    >
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Departamentos */}
      <TabsContent value="departments">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Departamentos
            </CardTitle>
            <CardDescription>
              Gerencie os departamentos da empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{dept.name}</h3>
                    <Badge variant="outline">{dept.userCount} usuários</Badge>
                  </div>
                  {dept.managerId && (
                    <p className="text-sm text-muted-foreground">
                      Gerente: {users.find(u => u.id === dept.managerId)?.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Aba de Funções */}
      <TabsContent value="roles">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Funções e Permissões
            </CardTitle>
            <CardDescription>
              Gerencie as funções e permissões dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{role.name}</h3>
                    <Badge variant="outline">{role.userCount} usuários</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Permissões:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Componente para formulário de criação de usuário
function CreateUserForm({ onSubmit, isLoading }: { onSubmit: (data: Partial<CompanyUser>) => void, isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'ADMIN' | 'MANAGER' | 'USER',
    department: '',
    position: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Digite o nome completo"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="usuario@empresa.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Função *</Label>
        <Select
          value={formData.role}
          onValueChange={(value: 'ADMIN' | 'MANAGER' | 'USER') =>
            setFormData(prev => ({ ...prev, role: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Administrador</SelectItem>
            <SelectItem value="MANAGER">Gerente</SelectItem>
            <SelectItem value="USER">Usuário</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Departamento *</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Administração">Administração</SelectItem>
            <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
            <SelectItem value="Operações">Operações</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Cargo *</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          placeholder="Digite o cargo"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Criando...
            </>
          ) : (
            'Criar Usuário'
          )}
        </Button>
      </div>
    </form>
  );
} 