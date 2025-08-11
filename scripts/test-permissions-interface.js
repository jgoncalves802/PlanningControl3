const fetch = require('node-fetch')

async function testPermissionsInterface() {
  const userId = '7b31ab25-aa54-46b9-85ed-323d3757002c'
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testando interface de permissões via API para userId:', userId)
  
  try {
    // 1. Testar GET - Carregar permissões
    console.log('\n1. Testando GET /api/settings/user-permissions/' + userId)
    
    try {
      const getResponse = await fetch(`${baseUrl}/api/settings/user-permissions/${userId}`)
      console.log('Status:', getResponse.status)
      
      if (getResponse.ok) {
        const data = await getResponse.json()
        console.log('✅ Permissões carregadas:', {
          userId: data.userId,
          role: data.role,
          hasCustomPermissions: !!data.customPermissions,
          permissionsCount: Object.keys(data.permissions || {}).length
        })
      } else {
        const error = await getResponse.text()
        console.log('❌ Erro ao carregar permissões:', error)
      }
    } catch (error) {
      console.log('❌ Erro de rede ao carregar permissões:', error.message)
    }
    
    // 2. Testar PUT - Salvar permissões personalizadas
    console.log('\n2. Testando PUT /api/settings/user-permissions/' + userId)
    
    const customPermissions = {
      dashboard: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: true,
        canImport: false
      },
      employees: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canCreate: true,
        canExport: true,
        canImport: false
      },
      contracts: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      budgets: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      safety: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      planning: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      transfers: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      employeeAssignment: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      workforceControl: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      nfcManagement: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      analytics: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: true,
        canImport: false
      },
      settings: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      backup: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canExport: false,
        canImport: false
      },
      canManageUsers: false,
      canManageCompanies: false,
      canAccessSuperAdmin: false,
      canAccessCompanyAdmin: false,
      canViewAuditLogs: false,
      canManageSystemSettings: false,
      canAccessReports: true
    }
    
    try {
      const putResponse = await fetch(`${baseUrl}/api/settings/user-permissions/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: customPermissions,
          role: 'SUPER_ADMIN'
        })
      })
      
      console.log('Status:', putResponse.status)
      
      if (putResponse.ok) {
        const data = await putResponse.json()
        console.log('✅ Permissões salvas:', data.message)
      } else {
        const error = await putResponse.text()
        console.log('❌ Erro ao salvar permissões:', error)
      }
    } catch (error) {
      console.log('❌ Erro de rede ao salvar permissões:', error.message)
    }
    
    // 3. Testar GET novamente para verificar se foram salvas
    console.log('\n3. Verificando se as permissões foram salvas...')
    
    try {
      const getResponse2 = await fetch(`${baseUrl}/api/settings/user-permissions/${userId}`)
      
      if (getResponse2.ok) {
        const data = await getResponse2.json()
        console.log('✅ Permissões após salvar:', {
          userId: data.userId,
          role: data.role,
          hasCustomPermissions: !!data.customPermissions,
          customPermissionsCount: Object.keys(data.customPermissions || {}).length
        })
      } else {
        const error = await getResponse2.text()
        console.log('❌ Erro ao verificar permissões:', error)
      }
    } catch (error) {
      console.log('❌ Erro de rede ao verificar permissões:', error.message)
    }
    
    // 4. Testar DELETE - Resetar permissões
    console.log('\n4. Testando DELETE /api/settings/user-permissions/' + userId)
    
    try {
      const deleteResponse = await fetch(`${baseUrl}/api/settings/user-permissions/${userId}`, {
        method: 'DELETE'
      })
      
      console.log('Status:', deleteResponse.status)
      
      if (deleteResponse.ok) {
        const data = await deleteResponse.json()
        console.log('✅ Permissões resetadas:', data.message)
      } else {
        const error = await deleteResponse.text()
        console.log('❌ Erro ao resetar permissões:', error)
      }
    } catch (error) {
      console.log('❌ Erro de rede ao resetar permissões:', error.message)
    }
    
    // 5. Verificar estado final
    console.log('\n5. Verificando estado final...')
    
    try {
      const getResponse3 = await fetch(`${baseUrl}/api/settings/user-permissions/${userId}`)
      
      if (getResponse3.ok) {
        const data = await getResponse3.json()
        console.log('✅ Estado final:', {
          userId: data.userId,
          role: data.role,
          hasCustomPermissions: !!data.customPermissions,
          message: data.message || 'Sem mensagem'
        })
      } else {
        const error = await getResponse3.text()
        console.log('❌ Erro ao verificar estado final:', error)
      }
    } catch (error) {
      console.log('❌ Erro de rede ao verificar estado final:', error.message)
    }
    
    console.log('\n🎉 Teste da interface de permissões concluído!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPermissionsInterface() 