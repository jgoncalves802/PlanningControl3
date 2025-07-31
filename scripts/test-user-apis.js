// Script para testar as APIs HTTP de usuários
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/settings/super-admin/users';

async function testUserAPIs() {
  try {
    console.log('🧪 Testando APIs HTTP de usuários...');
    console.log('=====================================');
    
    // 1. Testar GET - Listar usuários
    console.log('\n📋 1. Testando GET /api/settings/super-admin/users...');
    const listResponse = await fetch(`${BASE_URL}?page=1&limit=10`);
    
    if (!listResponse.ok) {
      throw new Error(`Erro ao listar usuários: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const listData = await listResponse.json();
    console.log(`✅ Usuários listados com sucesso: ${listData.users.length} usuários`);
    console.log(`   Total: ${listData.stats.total}`);
    console.log(`   Paginação: ${listData.pagination.page}/${listData.pagination.totalPages}`);
    
    // 2. Testar POST - Criar usuário sem Clerk ID
    console.log('\n➕ 2. Testando POST /api/settings/super-admin/users (sem Clerk ID)...');
    const createDataWithoutClerk = {
      name: 'Usuário Teste API Sem Clerk',
      email: `teste.api.sem.clerk.${Date.now()}@exemplo.com`
    };
    
    const createResponseWithoutClerk = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createDataWithoutClerk),
    });
    
    if (!createResponseWithoutClerk.ok) {
      const error = await createResponseWithoutClerk.json();
      throw new Error(`Erro ao criar usuário sem Clerk ID: ${error.error}`);
    }
    
    const createdUserWithoutClerk = await createResponseWithoutClerk.json();
    console.log(`✅ Usuário criado sem Clerk ID: ${createdUserWithoutClerk.user.name} (${createdUserWithoutClerk.user.email})`);
    console.log(`   ID: ${createdUserWithoutClerk.user.id}`);
    console.log(`   Clerk ID: ${createdUserWithoutClerk.user.clerkId || 'Não definido'}`);
    
    // 3. Testar POST - Criar usuário com Clerk ID
    console.log('\n➕ 3. Testando POST /api/settings/super-admin/users (com Clerk ID)...');
    const createDataWithClerk = {
      name: 'Usuário Teste API Com Clerk',
      email: `teste.api.com.clerk.${Date.now()}@exemplo.com`,
      clerkId: `clerk_test_api_${Date.now()}`
    };
    
    const createResponseWithClerk = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createDataWithClerk),
    });
    
    if (!createResponseWithClerk.ok) {
      const error = await createResponseWithClerk.json();
      throw new Error(`Erro ao criar usuário com Clerk ID: ${error.error}`);
    }
    
    const createdUserWithClerk = await createResponseWithClerk.json();
    console.log(`✅ Usuário criado com Clerk ID: ${createdUserWithClerk.user.name} (${createdUserWithClerk.user.email})`);
    console.log(`   ID: ${createdUserWithClerk.user.id}`);
    console.log(`   Clerk ID: ${createdUserWithClerk.user.clerkId}`);
    
    // 4. Testar PUT - Atualizar usuário sem Clerk ID
    console.log('\n✏️ 4. Testando PUT /api/settings/super-admin/users (adicionar Clerk ID)...');
    const updateDataAddClerk = {
      id: createdUserWithoutClerk.user.id,
      name: 'Usuário Teste API Atualizado Com Clerk',
      email: createdUserWithoutClerk.user.email,
      clerkId: `clerk_added_later_${Date.now()}`
    };
    
    const updateResponseAddClerk = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDataAddClerk),
    });
    
    if (!updateResponseAddClerk.ok) {
      const error = await updateResponseAddClerk.json();
      throw new Error(`Erro ao adicionar Clerk ID: ${error.error}`);
    }
    
    const updatedUserWithClerk = await updateResponseAddClerk.json();
    console.log(`✅ Clerk ID adicionado: ${updatedUserWithClerk.user.name} (${updatedUserWithClerk.user.email})`);
    console.log(`   Clerk ID: ${updatedUserWithClerk.user.clerkId}`);
    
    // 5. Testar PUT - Atualizar usuário com Clerk ID
    console.log('\n✏️ 5. Testando PUT /api/settings/super-admin/users (atualizar Clerk ID)...');
    const updateDataChangeClerk = {
      id: createdUserWithClerk.user.id,
      name: 'Usuário Teste API Atualizado',
      email: createdUserWithClerk.user.email,
      clerkId: `clerk_updated_${Date.now()}`
    };
    
    const updateResponseChangeClerk = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDataChangeClerk),
    });
    
    if (!updateResponseChangeClerk.ok) {
      const error = await updateResponseChangeClerk.json();
      throw new Error(`Erro ao atualizar Clerk ID: ${error.error}`);
    }
    
    const updatedUserChangedClerk = await updateResponseChangeClerk.json();
    console.log(`✅ Clerk ID atualizado: ${updatedUserChangedClerk.user.name} (${updatedUserChangedClerk.user.email})`);
    console.log(`   Clerk ID: ${updatedUserChangedClerk.user.clerkId}`);
    
    // 6. Testar GET - Permissões do usuário
    console.log('\n🔐 6. Testando GET /api/settings/super-admin/users/{id}/permissions...');
    const permissionsResponse = await fetch(`${BASE_URL}/${updatedUserChangedClerk.user.id}/permissions`);
    
    if (!permissionsResponse.ok) {
      const error = await permissionsResponse.json();
      throw new Error(`Erro ao buscar permissões: ${error.error}`);
    }
    
    const permissionsData = await permissionsResponse.json();
    console.log(`✅ Permissões carregadas: ${permissionsData.permissions.length} contratos`);
    console.log(`   Usuário: ${permissionsData.user.name} (${permissionsData.user.email})`);
    console.log(`   Contratos atribuídos: ${permissionsData.stats.assignedContracts}/${permissionsData.stats.totalContracts}`);
    
    // 7. Testar POST - Adicionar permissão
    if (permissionsData.permissions.length > 0) {
      console.log('\n➕ 7. Testando POST /api/settings/super-admin/users/{id}/permissions...');
      const contractToAssign = permissionsData.permissions[0];
      
      const addPermissionResponse = await fetch(`${BASE_URL}/${updatedUserChangedClerk.user.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId: contractToAssign.id }),
      });
      
      if (!addPermissionResponse.ok) {
        const error = await addPermissionResponse.json();
        console.log(`⚠️ Erro ao adicionar permissão: ${error.error}`);
      } else {
        const addPermissionData = await addPermissionResponse.json();
        console.log(`✅ Permissão adicionada: ${addPermissionData.user.name} -> ${addPermissionData.contract.name}`);
        
        // 8. Testar DELETE - Remover permissão
        console.log('\n🗑️ 8. Testando DELETE /api/settings/super-admin/users/{id}/permissions...');
        const removePermissionResponse = await fetch(`${BASE_URL}/${updatedUserChangedClerk.user.id}/permissions?contractId=${contractToAssign.id}`, {
          method: 'DELETE',
        });
        
        if (!removePermissionResponse.ok) {
          const error = await removePermissionResponse.json();
          console.log(`⚠️ Erro ao remover permissão: ${error.error}`);
        } else {
          const removePermissionData = await removePermissionResponse.json();
          console.log(`✅ Permissão removida: ${removePermissionData.user.name} -> ${removePermissionData.contract.name}`);
        }
      }
    } else {
      console.log('⚠️ Nenhum contrato disponível para testar permissões');
    }
    
    // 9. Testar DELETE - Deletar usuários
    console.log('\n🗑️ 9. Testando DELETE /api/settings/super-admin/users...');
    
    // Deletar usuário com Clerk ID
    const deleteResponse1 = await fetch(`${BASE_URL}?id=${updatedUserChangedClerk.user.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteResponse1.ok) {
      const error = await deleteResponse1.json();
      console.log(`⚠️ Erro ao deletar usuário com Clerk ID: ${error.error}`);
      if (error.details) {
        console.log(`   Detalhes: ${JSON.stringify(error.details)}`);
      }
    } else {
      const deleteData1 = await deleteResponse1.json();
      console.log(`✅ Usuário com Clerk ID deletado: ${deleteData1.message}`);
    }
    
    // Deletar usuário sem Clerk ID
    const deleteResponse2 = await fetch(`${BASE_URL}?id=${updatedUserWithClerk.user.id}`, {
      method: 'DELETE',
    });
    
    if (!deleteResponse2.ok) {
      const error = await deleteResponse2.json();
      console.log(`⚠️ Erro ao deletar usuário sem Clerk ID: ${error.error}`);
      if (error.details) {
        console.log(`   Detalhes: ${JSON.stringify(error.details)}`);
      }
    } else {
      const deleteData2 = await deleteResponse2.json();
      console.log(`✅ Usuário sem Clerk ID deletado: ${deleteData2.message}`);
    }
    
    // 10. Verificar se usuários foram deletados
    console.log('\n🔍 10. Verificando se usuários foram deletados...');
    const verifyResponse = await fetch(`${BASE_URL}?page=1&limit=10`);
    const verifyData = await verifyResponse.json();
    
    const user1StillExists = verifyData.users.find(u => u.id === updatedUserChangedClerk.user.id);
    const user2StillExists = verifyData.users.find(u => u.id === updatedUserWithClerk.user.id);
    
    if (!user1StillExists && !user2StillExists) {
      console.log('✅ Confirmação: Ambos os usuários foram deletados com sucesso');
    } else {
      console.log('❌ Erro: Usuários ainda existem após deleção');
    }
    
    console.log('\n🎯 Teste das APIs HTTP de usuários concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante teste das APIs:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando em http://localhost:3000');
      console.log('   Execute: npm run dev');
    }
  }
}

// Executar o teste
testUserAPIs()
  .then(() => {
    console.log('\n✅ Todos os testes de API foram executados!');
  })
  .catch(error => {
    console.error('❌ Falha nos testes de API:', error);
    process.exit(1);
  }); 