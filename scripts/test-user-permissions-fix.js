const fetch = require('node-fetch');

async function testUserPermissionsAPI() {
  console.log('🧪 Testando API de user-permissions corrigida...');

  const testUserId = 'cmdt1nl930001i8bc2qwokeuu'; // O userId que estava causando erro

  try {
    console.log(`\n📡 Testando GET /api/settings/user-permissions/${testUserId}`);
    
    const response = await fetch(`http://localhost:3001/api/settings/user-permissions/${testUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Erro:', error);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Testar também com um userId válido
async function testWithValidUserId() {
  console.log('\n🧪 Testando com um userId válido...');
  
  try {
    // Primeiro buscar um usuário válido
    const usersResponse = await fetch('http://localhost:3001/api/settings/super-admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      if (users.users && users.users.length > 0) {
        const validUserId = users.users[0].id;
        console.log(`📡 Testando com userId válido: ${validUserId}`);
        
        const response = await fetch(`http://localhost:3001/api/settings/user-permissions/${validUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('Status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Resposta válida:', JSON.stringify(data, null, 2));
        } else {
          const error = await response.text();
          console.log('❌ Erro:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao testar com userId válido:', error);
  }
}

async function runTests() {
  await testUserPermissionsAPI();
  await testWithValidUserId();
}

runTests(); 