// Script para testar o login
const http = require('http');

function testLogin(email, password) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify({ email, password }));
    req.end();
  });
}

async function testLoginCredentials() {
  try {
    console.log('🧪 Testando credenciais de login...');
    
    const testCredentials = [
      {
        email: 'superadmin@planningcontrol.com',
        password: '123456',
        description: 'Super Admin'
      },
      {
        email: 'admin@planningcontrol.com',
        password: '123456',
        description: 'Admin Regular'
      },
      {
        email: 'admin@demo-company.com',
        password: '123456',
        description: 'Admin Demo'
      }
    ];
    
    for (const credential of testCredentials) {
      console.log(`\n📋 Testando: ${credential.description}`);
      console.log(`   Email: ${credential.email}`);
      console.log(`   Senha: ${credential.password}`);
      
      try {
        const result = await testLogin(credential.email, credential.password);
        console.log(`   Status: ${result.status}`);
        console.log(`   Resultado: ${JSON.stringify(result.data, null, 2)}`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    console.log('\n🎯 Instruções para testar no navegador:');
    console.log('   1. Acesse: http://localhost:3000/login');
    console.log('   2. Use uma das credenciais:');
    console.log('      - Super Admin: superadmin@planningcontrol.com / 123456');
    console.log('      - Admin Regular: admin@planningcontrol.com / 123456');
    console.log('   3. Clique em "Entrar"');
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

testLoginCredentials(); 