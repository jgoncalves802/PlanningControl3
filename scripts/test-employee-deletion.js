const https = require('https');
const http = require('http');

async function testEmployeeDeletion() {
  try {
    console.log('🧪 Testando deleção de funcionário com transferências');
    console.log('================================================');
    console.log('');

    // ID de um funcionário que tem transferências
    const employeeId = 'cmdnz5xg8000di840da3w6181';
    
    console.log(`🔄 Tentando deletar funcionário: ${employeeId}`);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/employees/${employeeId}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await new Promise((resolve, reject) => {
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
            resolve({ status: res.statusCode, data: { error: 'Invalid JSON', raw: data } });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    console.log(`📊 Status da resposta: ${response.status}`);
    console.log('📋 Dados da resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === 400) {
      console.log('');
      console.log('✅ Teste PASSOU: Sistema corretamente impediu a deleção');
      console.log('✅ Erro apropriado retornado (400 Bad Request)');
      console.log(`✅ Mensagem: ${response.data.error}`);
      console.log(`✅ Detalhes: ${response.data.details}`);
      if (response.data.transferRequestsCount) {
        console.log(`✅ Transferências encontradas: ${response.data.transferRequestsCount}`);
      }
    } else if (response.status === 200) {
      console.log('');
      console.log('⚠️ Funcionário foi deletado com sucesso');
      console.log('⚠️ Isso significa que não havia transferências associadas');
    } else {
      console.log('');
      console.log('❌ Resposta inesperada');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEmployeeDeletion(); 