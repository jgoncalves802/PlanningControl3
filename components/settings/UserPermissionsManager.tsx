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
import { Save, RotateCcw, Eye, Edit, Trash2, Plus, Download, Upload } from 'lucide-react'

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

  useEffect(() => {
    loadUserPermissions()
  }, [userId])

  const loadUserPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/settings/user-permissions/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
        setCustomPermissions(data.customPermissions)
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
    if (!customPermissions) return

    setCustomPermissions(prev => {
      if (!prev) return prev

      const updated = { ...prev }
      const pagePermissions = updated[page] as any

      if (pagePermissions && typeof pagePermissions === 'object') {
        pagePermissions[action] = value
      } else if (typeof updated[page] === 'boolean') {
        (updated as any)[page] = value
      }

      return updated
    })
  }

  const renderPagePermissions = (page: keyof UserPermissions, pageName: string) => {
    const pagePermissions = permissions?.[page] as any
    const customPagePermissions = customPermissions?.[page] as any

    if (!pagePermissions) return null

    // Se é um objeto de permissões (página)
    if (typeof pagePermissions === 'object' && pagePermissions.canView !== undefined) {
      return (
        <Card key={page} className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {pageName}
              {customPagePermissions && (
                <Badge variant="secondary" className="text-xs">
                  Personalizado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(pagePermissions).map(([action, defaultValue]) => (
                <div key={action} className="flex items-center space-x-2">
                  <Switch
                    id={`${page}-${action}`}
                    checked={customPagePermissions?.[action] ?? defaultValue}
                    onCheckedChange={(checked) => updatePagePermission(page, action, checked)}
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
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    // Se é uma permissão booleana simples
    return (
      <div key={page} className="flex items-center justify-between p-3 border rounded-lg">
        <Label htmlFor={page} className="text-sm font-medium">
          {pageName}
        </Label>
        <Switch
          id={page}
          checked={customPagePermissions ?? pagePermissions}
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
          </div>

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={savePermissions} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Permissões
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
          </div>

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