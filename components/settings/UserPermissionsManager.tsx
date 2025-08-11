'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { UserPermissions, getDefaultPermissions } from '@/lib/types/permissions'
import { toast } from 'react-hot-toast'
import { Save, RotateCcw, Eye, Edit, Trash2, Plus, Download, Upload, AlertTriangle } from 'lucide-react'

interface UserPermissionsManagerProps {
  userId: string
  userName: string
  userRole: string
  onPermissionsUpdated?: () => void
}

export default function UserPermissionsManager({
  userId,
  userName,
  userRole,
  onPermissionsUpdated
}: UserPermissionsManagerProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [customPermissions, setCustomPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadUserPermissions()
  }, [userId])

  // Monitorar mudanças no customPermissions
  useEffect(() => {
    console.log('🔄 customPermissions atualizado:', customPermissions)
    setHasChanges(true)
  }, [customPermissions])

  const loadUserPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/user-permissions/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
        setCustomPermissions(data.customPermissions)
        setHasChanges(false)
      } else {
        toast.error('Erro ao carregar permissões')
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      toast.error('Erro ao carregar permissões')
    } finally {
      setLoading(false)
    }
  }

  const savePermissions = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/settings/user-permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: customPermissions,
          role: userRole
        })
      })

      if (response.ok) {
        toast.success('Permissões salvas com sucesso')
        await loadUserPermissions()
        onPermissionsUpdated?.()
        setHasChanges(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar permissões')
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      toast.error('Erro ao salvar permissões')
    } finally {
      setSaving(false)
    }
  }

  const resetPermissions = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/settings/user-permissions/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Permissões personalizadas removidas')
        await loadUserPermissions()
        onPermissionsUpdated?.()
        setHasChanges(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao resetar permissões')
      }
    } catch (error) {
      console.error('Erro ao resetar permissões:', error)
      toast.error('Erro ao resetar permissões')
    } finally {
      setSaving(false)
    }
  }

  const updatePagePermission = (page: keyof UserPermissions, action: string, value: boolean) => {
    console.log('🔄 Atualizando permissão:', { page, action, value })
    
    setCustomPermissions(prev => {
      const updated = { ...prev } || {}
      
      // Se a página não existe no customPermissions, criar com as permissões padrão
      if (!updated[page]) {
        const defaultPagePermissions = permissions?.[page] as any
        if (defaultPagePermissions && typeof defaultPagePermissions === 'object') {
          updated[page] = { ...defaultPagePermissions }
        } else {
          updated[page] = {}
        }
      }
      
      const pagePermissions = updated[page] as any
      
      if (pagePermissions && typeof pagePermissions === 'object') {
        pagePermissions[action] = value
        console.log('✅ Permissão atualizada:', { page, action, value, pagePermissions })
      } else if (typeof updated[page] === 'boolean') {
        (updated as any)[page] = value
        console.log('✅ Permissão booleana atualizada:', { page, value })
      }
      
      console.log('🔄 Novo estado customPermissions:', updated)
      return updated
    })
  }

  // Função para verificar se uma página deve ser oculta (todas as permissões false)
  const shouldHidePage = (page: keyof UserPermissions): boolean => {
    const pagePermissions = permissions?.[page] as any
    const customPagePermissions = customPermissions?.[page] as any

    if (!pagePermissions) return false

    // Se é um objeto de permissões (página)
    if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
      const effectivePermissions = customPagePermissions || pagePermissions
      const allPermissions = ['canView', 'canEdit', 'canDelete', 'canCreate', 'canExport', 'canImport']
      
      // Verificar se todas as permissões estão false
      return allPermissions.every(perm => !effectivePermissions[perm])
    }

    // Se é uma permissão booleana simples
    const effectiveValue = customPagePermissions !== undefined ? customPagePermissions : pagePermissions
    return !effectiveValue
  }

  // Função para obter o valor efetivo de uma permissão
  const getEffectivePermission = (page: keyof UserPermissions, action?: string): boolean => {
    const pagePermissions = permissions?.[page] as any
    const customPagePermissions = customPermissions?.[page] as any

    if (!pagePermissions) return false

    // Se é um objeto de permissões (página)
    if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
      if (action) {
        return customPagePermissions?.[action] ?? pagePermissions[action]
      }
      return false
    }

    // Se é uma permissão booleana simples
    return customPagePermissions !== undefined ? customPagePermissions : pagePermissions
  }

  const renderPagePermissions = (page: keyof UserPermissions, pageName: string) => {
    const pagePermissions = permissions?.[page] as any
    const customPagePermissions = customPermissions?.[page] as any

    console.log(`🔄 Renderizando permissões para ${page}:`, {
      pagePermissions,
      customPagePermissions,
      hasCustomPermissions: !!customPagePermissions
    })

    if (!pagePermissions) return null

    // Se é um objeto de permissões (página)
    if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
      const isHidden = shouldHidePage(page)
      
      return (
        <Card key={page} className={`mb-4 ${isHidden ? 'border-red-200 bg-red-50' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {pageName}
              {customPagePermissions && (
                <Badge variant="secondary" className="text-xs">
                  Personalizado
                </Badge>
              )}
              {isHidden && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Oculto do Sidebar
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(pagePermissions).map(([action, defaultValue]) => {
                const effectiveValue = getEffectivePermission(page, action)
                return (
                  <div key={action} className="flex items-center space-x-2">
                    <Switch
                      id={`${page}-${action}`}
                      checked={effectiveValue}
                      onCheckedChange={(checked) => {
                        console.log('🔄 Switch alterado:', { page, action, checked })
                        updatePagePermission(page, action, checked)
                      }}
                    />
                    <Label htmlFor={`${page}-${action}`} className="text-sm flex items-center gap-1">
                      {action === 'canView' && <Eye className="h-3 w-3" />}
                      {action === 'canEdit' && <Edit className="h-3 w-3" />}
                      {action === 'canDelete' && <Trash2 className="h-3 w-3" />}
                      {action === 'canCreate' && <Plus className="h-3 w-3" />}
                      {action === 'canExport' && <Download className="h-3 w-3" />}
                      {action === 'canImport' && <Upload className="h-3 w-3" />}
                      {action === 'canView' && 'Visualizar'}
                      {action === 'canEdit' && 'Editar'}
                      {action === 'canDelete' && 'Excluir'}
                      {action === 'canCreate' && 'Criar'}
                      {action === 'canExport' && 'Exportar'}
                      {action === 'canImport' && 'Importar'}
                    </Label>
                  </div>
                )
              })}
            </div>
            {isHidden && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ Esta página será oculta do sidebar pois todas as permissões estão desabilitadas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    // Se é uma permissão booleana simples
    const effectiveValue = getEffectivePermission(page)
    const isHidden = !effectiveValue

    return (
      <div key={page} className={`flex items-center justify-between p-3 border rounded-lg ${isHidden ? 'border-red-200 bg-red-50' : ''}`}>
        <div className="flex items-center gap-2">
          <Label htmlFor={page} className="text-sm font-medium">
            {pageName}
          </Label>
          {isHidden && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Oculto
            </Badge>
          )}
        </div>
        <Switch
          id={page}
          checked={effectiveValue}
          onCheckedChange={(checked) => updatePagePermission(page, 'value', checked)}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando permissões...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!permissions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600">Erro ao carregar permissões</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Permissões - {userName}</CardTitle>
          <CardDescription>
            Configure as permissões granulares para este usuário. 
            As permissões personalizadas sobrescrevem as padrão do role.
            Páginas com todas as permissões desabilitadas serão ocultas do sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline">
              Role: {userRole}
            </Badge>
            {customPermissions && (
              <Badge variant="secondary">
                Permissões Personalizadas Ativas
              </Badge>
            )}
            {hasChanges && (
              <Badge variant="default" className="bg-orange-500">
                Alterações Pendentes
              </Badge>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={savePermissions} 
              disabled={saving || !hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetPermissions}
              disabled={saving || !customPermissions}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar para Padrão
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-2"
            >
              🐛 Debug
            </Button>
          </div>

          {debugMode && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-semibold mb-2">🐛 Debug Info:</h4>
              <div className="text-sm space-y-1">
                <div>Permissions: {JSON.stringify(permissions, null, 2)}</div>
                <div>Custom Permissions: {JSON.stringify(customPermissions, null, 2)}</div>
                <div>Has Changes: {hasChanges}</div>
              </div>
            </div>
          )}

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Páginas</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <div className="grid gap-4">
                {renderPagePermissions('dashboard', 'Dashboard')}
                {renderPagePermissions('employees', 'Funcionários')}
                {renderPagePermissions('contracts', 'Contratos')}
                {renderPagePermissions('budgets', 'Orçamentos')}
                {renderPagePermissions('safety', 'Segurança')}
                {renderPagePermissions('planning', 'Planejamento')}
                {renderPagePermissions('transfers', 'Transferências')}
                {renderPagePermissions('employeeAssignment', 'Alocação de Efetivo')}
                {renderPagePermissions('workforceControl', 'Controle de Efetivo')}
                {renderPagePermissions('nfcManagement', 'Gestão NFC')}
                {renderPagePermissions('analytics', 'Analytics')}
                {renderPagePermissions('settings', 'Configurações')}
                {renderPagePermissions('backup', 'Backup')}
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4">
                {renderPagePermissions('canManageUsers', 'Gerenciar Usuários')}
                {renderPagePermissions('canManageCompanies', 'Gerenciar Empresas')}
                {renderPagePermissions('canAccessSuperAdmin', 'Acesso Super Admin')}
                {renderPagePermissions('canAccessCompanyAdmin', 'Acesso Company Admin')}
                {renderPagePermissions('canViewAuditLogs', 'Visualizar Logs de Auditoria')}
                {renderPagePermissions('canManageSystemSettings', 'Gerenciar Configurações do Sistema')}
                {renderPagePermissions('canAccessReports', 'Acesso a Relatórios')}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 