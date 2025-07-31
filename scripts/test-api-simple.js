// Script simples para testar a API
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🧪 Testando API...');
    
    // 1. Testar GET
    console.log('\n📋 1. Testando GET...');
    const getResponse = await makeRequest('/api/settings/super-admin/users');
    console.log('GET Response:', JSON.stringify(getResponse.data, null, 2));
    
    // 2. Testar POST - Criar usuário sem Clerk ID
    console.log('\n➕ 2. Testando POST (sem Clerk ID)...');
    const postData = {
      name: 'Usuário Teste API',
      email: `teste.api.${Date.now()}@exemplo.com`
    };
    
    const postResponse = await makeRequest('/api/settings/super-admin/users', 'POST', postData);
    console.log('POST Response:', JSON.stringify(postResponse.data, null, 2));
    
    if (postResponse.status === 201) {
      console.log('✅ Usuário criado com sucesso!');
      
      // 3. Testar POST - Criar usuário com Clerk ID
      console.log('\n➕ 3. Testando POST (com Clerk ID)...');
      const postDataWithClerk = {
        name: 'Usuário Teste API Com Clerk',
        email: `teste.api.clerk.${Date.now()}@exemplo.com`,
        clerkId: `clerk_test_api_${Date.now()}`
      };
      
      const postResponseWithClerk = await makeRequest('/api/settings/super-admin/users', 'POST', postDataWithClerk);
      console.log('POST com Clerk Response:', JSON.stringify(postResponseWithClerk.data, null, 2));
      
      if (postResponseWithClerk.status === 201) {
        console.log('✅ Usuário com Clerk ID criado com sucesso!');
        
        // 4. Testar PUT - Atualizar usuário
        console.log('\n✏️ 4. Testando PUT (adicionar Clerk ID)...');
        const putData = {
          id: postResponse.data.user.id,
          name: 'Usuário Teste API Atualizado',
          email: postResponse.data.user.email,
          clerkId: `clerk_added_later_${Date.now()}`
        };
        
        const putResponse = await makeRequest('/api/settings/super-admin/users', 'PUT', putData);
        console.log('PUT Response:', JSON.stringify(putResponse.data, null, 2));
        
        // 5. Testar DELETE - Deletar ambos os usuários
        console.log('\n🗑️ 5. Testando DELETE...');
        const deleteResponse1 = await makeRequest(`/api/settings/super-admin/users?id=${postResponse.data.user.id}`, 'DELETE');
        console.log('DELETE 1 Response:', JSON.stringify(deleteResponse1.data, null, 2));
        
        const deleteResponse2 = await makeRequest(`/api/settings/super-admin/users?id=${postResponseWithClerk.data.user.id}`, 'DELETE');
        console.log('DELETE 2 Response:', JSON.stringify(deleteResponse2.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAPI(); 