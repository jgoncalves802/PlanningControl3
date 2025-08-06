'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, X, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

interface UserPermissions {
  id: string
  userId: string
  page: string
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canCreate: boolean
  canExport: boolean
  canImport: boolean
  createdAt: string
  updatedAt: string
}

interface SystemPermissions {
  id: string
  userId: string
  permission: string
  isGranted: boolean
  createdAt: string
  updatedAt: string
}

interface UserPermissionsManagerProps {
  selectedUserId?: string
  onClose: () => void
}

const AVAILABLE_PAGES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Página principal do sistema' },
  { id: 'employees', name: 'Funcionários', description: 'Gerenciamento de funcionários' },
  { id: 'functions', name: 'Funções', description: 'Gerenciamento de funções' },
  { id: 'contracts', name: 'Contratos', description: 'Gerenciamento de contratos' },
  { id: 'budgets', name: 'Orçamentos', description: 'Gerenciamento de orçamentos' },
  { id: 'transfers', name: 'Transferências', description: 'Gerenciamento de transferências' },
  { id: 'workforce', name: 'Controle de Força', description: 'Controle de força de trabalho' },
  { id: 'nfc-management', name: 'Gestão NFC', description: 'Gerenciamento de badges NFC' },
  { id: 'analytics', name: 'Analytics', description: 'Relatórios e análises' },
  { id: 'settings', name: 'Configurações', description: 'Configurações do sistema' }
]

const SYSTEM_PERMISSIONS = [
  { id: 'user_management', name: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários' },
  { id: 'company_management', name: 'Gerenciar Empresas', description: 'Criar, editar e excluir empresas' },
  { id: 'audit_logs', name: 'Logs de Auditoria', description: 'Visualizar logs de auditoria' },
  { id: 'system_settings', name: 'Configurações do Sistema', description: 'Alterar configurações globais' },
  { id: 'data_export', name: 'Exportar Dados', description: 'Exportar dados do sistema' },
  { id: 'data_import', name: 'Importar Dados', description: 'Importar dados para o sistema' }
]

export function UserPermissionsManager({ selectedUserId, onClose }: UserPermissionsManagerProps) {
  const { toast } = useToast()
  const { user: currentUser } = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [pagePermissions, setPagePermissions] = useState<UserPermissions[]>([])
  const [systemPermissions, setSystemPermissions] = useState<SystemPermissions[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Carregar dados do usuário selecionado
  useEffect(() => {
    if (!selectedUserId) return

    const loadUserData = async () => {
      setLoading(true)
      try {
        // Buscar informações do usuário
        const userResponse = await fetch(`/api/settings/super-admin/users/${selectedUserId}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserInfo(userData)
        }

        // Buscar permissões de páginas
        const pagePermissionsResponse = await fetch(`/api/settings/user-permissions/${selectedUserId}/pages`)
        if (pagePermissionsResponse.ok) {
          const pageData = await pagePermissionsResponse.json()
          setPagePermissions(pageData)
        }

        // Buscar permissões do sistema
        const systemPermissionsResponse = await fetch(`/api/settings/user-permissions/${selectedUserId}/system`)
        if (systemPermissionsResponse.ok) {
          const systemData = await systemPermissionsResponse.json()
          setSystemPermissions(systemData)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do usuário',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [selectedUserId, toast])

  // Verificar se o usuário atual pode gerenciar permissões
  const canManagePermissions = currentUser?.role === 'SUPER_ADMIN' || 
    (currentUser?.role === 'COMPANY_ADMIN' && userInfo?.companyId === currentUser?.companyId)

  // Verificar se o usuário selecionado pode ter suas permissões alteradas
  const canModifyUser = userInfo && (
    currentUser?.role === 'SUPER_ADMIN' ||
    (currentUser?.role === 'COMPANY_ADMIN' && 
     userInfo.role !== 'SUPER_ADMIN' && 
     userInfo.companyId === currentUser?.companyId)
  )

  // Atualizar permissão de página
  const updatePagePermission = (pageId: string, permission: keyof Omit<UserPermissions, 'id' | 'userId' | 'page' | 'createdAt' | 'updatedAt'>, value: boolean) => {
    setPagePermissions(prev => {
      const existing = prev.find(p => p.page === pageId)
      if (existing) {
        return prev.map(p => 
          p.page === pageId 
            ? { ...p, [permission]: value }
            : p
        )
      } else {
        return [...prev, {
          id: '',
          userId: selectedUserId!,
          page: pageId,
          canView: permission === 'canView' ? value : false,
          canEdit: permission === 'canEdit' ? value : false,
          canDelete: permission === 'canDelete' ? value : false,
          canCreate: permission === 'canCreate' ? value : false,
          canExport: permission === 'canExport' ? value : false,
          canImport: permission === 'canImport' ? value : false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      }
    })
    setHasChanges(true)
  }

  // Atualizar permissão do sistema
  const updateSystemPermission = (permissionId: string, value: boolean) => {
    setSystemPermissions(prev => {
      const existing = prev.find(p => p.permission === permissionId)
      if (existing) {
        return prev.map(p => 
          p.permission === permissionId 
            ? { ...p, isGranted: value }
            : p
        )
      } else {
        return [...prev, {
          id: '',
          userId: selectedUserId!,
          permission: permissionId,
          isGranted: value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      }
    })
    setHasChanges(true)
  }

  // Salvar permissões
  const savePermissions = async () => {
    if (!selectedUserId) return

    setSaving(true)
    try {
      // Salvar permissões de páginas
      const pageResponse = await fetch(`/api/settings/user-permissions/${selectedUserId}/pages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: pagePermissions })
      })

      // Salvar permissões do sistema
      const systemResponse = await fetch(`/api/settings/user-permissions/${selectedUserId}/system`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: systemPermissions })
      })

      if (pageResponse.ok && systemResponse.ok) {
        toast({
          title: 'Sucesso',
          description: 'Permissões atualizadas com sucesso',
        })
        setHasChanges(false)
      } else {
        throw new Error('Erro ao salvar permissões')
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as permissões',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!selectedUserId) {
    return null
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Permissões</CardTitle>
              <CardDescription>Carregando dados do usuário...</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canManagePermissions) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Permissões</CardTitle>
              <CardDescription>Acesso negado</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para gerenciar permissões de outros usuários.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!canModifyUser) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Permissões</CardTitle>
              <CardDescription>Usuário não pode ser modificado</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este usuário não pode ter suas permissões alteradas por você.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Permissões</CardTitle>
            <CardDescription>
              Configurar permissões para {userInfo?.name || 'Usuário'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                Alterações pendentes
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações do usuário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Nome</Label>
            <p className="text-sm">{userInfo?.name || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm">{userInfo?.email || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <Badge variant="outline">{userInfo?.role || 'N/A'}</Badge>
          </div>
        </div>

        {/* Permissões de Páginas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Permissões de Páginas</h3>
          <div className="space-y-4">
            {AVAILABLE_PAGES.map((page) => {
              const pagePermission = pagePermissions.find(p => p.page === page.id)
              return (
                <Card key={page.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{page.name}</CardTitle>
                        <CardDescription>{page.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-view`}
                          checked={pagePermission?.canView || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canView', checked)}
                        />
                        <Label htmlFor={`${page.id}-view`} className="text-sm">Visualizar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-edit`}
                          checked={pagePermission?.canEdit || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canEdit', checked)}
                        />
                        <Label htmlFor={`${page.id}-edit`} className="text-sm">Editar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-create`}
                          checked={pagePermission?.canCreate || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canCreate', checked)}
                        />
                        <Label htmlFor={`${page.id}-create`} className="text-sm">Criar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-delete`}
                          checked={pagePermission?.canDelete || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canDelete', checked)}
                        />
                        <Label htmlFor={`${page.id}-delete`} className="text-sm">Excluir</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-export`}
                          checked={pagePermission?.canExport || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canExport', checked)}
                        />
                        <Label htmlFor={`${page.id}-export`} className="text-sm">Exportar</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${page.id}-import`}
                          checked={pagePermission?.canImport || false}
                          onCheckedChange={(checked) => updatePagePermission(page.id, 'canImport', checked)}
                        />
                        <Label htmlFor={`${page.id}-import`} className="text-sm">Importar</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Permissões do Sistema */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Permissões do Sistema</h3>
          <div className="space-y-4">
            {SYSTEM_PERMISSIONS.map((permission) => {
              const systemPermission = systemPermissions.find(p => p.permission === permission.id)
              return (
                <Card key={permission.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{permission.name}</CardTitle>
                        <CardDescription>{permission.description}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${permission.id}`}
                          checked={systemPermission?.isGranted || false}
                          onCheckedChange={(checked) => updateSystemPermission(permission.id, checked)}
                        />
                        <Label htmlFor={`${permission.id}`} className="text-sm">
                          {systemPermission?.isGranted ? 'Concedida' : 'Negada'}
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button 
            onClick={savePermissions} 
            disabled={!hasChanges || saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 