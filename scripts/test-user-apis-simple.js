// Script simples para testar as APIs HTTP de usuários
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000/api/settings/super-admin/users';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testUserAPIs() {
  try {
    console.log('🧪 Testando APIs HTTP de usuários...');
    console.log('=====================================');
    
    // 1. Testar GET - Listar usuários
    console.log('\n📋 1. Testando GET /api/settings/super-admin/users...');
    const listResponse = await makeRequest(`${BASE_URL}?page=1&limit=10`);
    
    if (listResponse.status !== 200) {
      throw new Error(`Erro ao listar usuários: ${listResponse.status}`);
    }
    
    console.log(`✅ Usuários listados com sucesso: ${listResponse.data.users?.length || 0} usuários`);
    console.log(`   Total: ${listResponse.data.stats?.total || 0}`);
    
    // 2. Testar POST - Criar usuário sem Clerk ID
    console.log('\n➕ 2. Testando POST /api/settings/super-admin/users (sem Clerk ID)...');
    const createDataWithoutClerk = {
      name: 'Usuário Teste API Sem Clerk',
      email: `teste.api.sem.clerk.${Date.now()}@exemplo.com`
    };
    
    const createResponseWithoutClerk = await makeRequest(BASE_URL, {
      method: 'POST',
      body: createDataWithoutClerk
    });
    
    if (createResponseWithoutClerk.status !== 201) {
      throw new Error(`Erro ao criar usuário sem Clerk ID: ${createResponseWithoutClerk.data.error || createResponseWithoutClerk.status}`);
    }
    
    console.log(`✅ Usuário criado sem Clerk ID: ${createResponseWithoutClerk.data.user.name} (${createResponseWithoutClerk.data.user.email})`);
    console.log(`   ID: ${createResponseWithoutClerk.data.user.id}`);
    console.log(`   Clerk ID: ${createResponseWithoutClerk.data.user.clerkId || 'Não definido'}`);
    
    // 3. Testar POST - Criar usuário com Clerk ID
    console.log('\n➕ 3. Testando POST /api/settings/super-admin/users (com Clerk ID)...');
    const createDataWithClerk = {
      name: 'Usuário Teste API Com Clerk',
      email: `teste.api.com.clerk.${Date.now()}@exemplo.com`,
      clerkId: `clerk_test_api_${Date.now()}`
    };
    
    const createResponseWithClerk = await makeRequest(BASE_URL, {
      method: 'POST',
      body: createDataWithClerk
    });
    
    if (createResponseWithClerk.status !== 201) {
      throw new Error(`Erro ao criar usuário com Clerk ID: ${createResponseWithClerk.data.error || createResponseWithClerk.status}`);
    }
    
    console.log(`✅ Usuário criado com Clerk ID: ${createResponseWithClerk.data.user.name} (${createResponseWithClerk.data.user.email})`);
    console.log(`   ID: ${createResponseWithClerk.data.user.id}`);
    console.log(`   Clerk ID: ${createResponseWithClerk.data.user.clerkId}`);
    
    // 4. Testar PUT - Atualizar usuário (adicionar Clerk ID)
    console.log('\n✏️ 4. Testando PUT /api/settings/super-admin/users (adicionar Clerk ID)...');
    const updateDataAddClerk = {
      id: createResponseWithoutClerk.data.user.id,
      name: 'Usuário Teste API Atualizado Com Clerk',
      email: createResponseWithoutClerk.data.user.email,
      clerkId: `clerk_added_later_${Date.now()}`
    };
    
    const updateResponseAddClerk = await makeRequest(BASE_URL, {
      method: 'PUT',
      body: updateDataAddClerk
    });
    
    if (updateResponseAddClerk.status !== 200) {
      throw new Error(`Erro ao adicionar Clerk ID: ${updateResponseAddClerk.data.error || updateResponseAddClerk.status}`);
    }
    
    console.log(`✅ Clerk ID adicionado: ${updateResponseAddClerk.data.user.name} (${updateResponseAddClerk.data.user.email})`);
    console.log(`   Clerk ID: ${updateResponseAddClerk.data.user.clerkId}`);
    
    // 5. Testar DELETE - Deletar usuários
    console.log('\n🗑️ 5. Testando DELETE /api/settings/super-admin/users...');
    
    // Deletar usuário com Clerk ID
    const deleteResponse1 = await makeRequest(`${BASE_URL}?id=${createResponseWithClerk.data.user.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse1.status !== 200) {
      console.log(`⚠️ Erro ao deletar usuário com Clerk ID: ${deleteResponse1.data.error || deleteResponse1.status}`);
    } else {
      console.log(`✅ Usuário com Clerk ID deletado: ${deleteResponse1.data.message}`);
    }
    
    // Deletar usuário sem Clerk ID
    const deleteResponse2 = await makeRequest(`${BASE_URL}?id=${updateResponseAddClerk.data.user.id}`, {
      method: 'DELETE'
    });
    
    if (deleteResponse2.status !== 200) {
      console.log(`⚠️ Erro ao deletar usuário sem Clerk ID: ${deleteResponse2.data.error || deleteResponse2.status}`);
    } else {
      console.log(`✅ Usuário sem Clerk ID deletado: ${deleteResponse2.data.message}`);
    }
    
    console.log('\n🎯 Teste das APIs HTTP de usuários concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante teste das APIs:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
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