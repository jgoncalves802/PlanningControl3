const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testando API...');
  
  try {
    // Testar a API de user-permissions
    const response = await fetch('http://localhost:3000/api/settings/user-permissions/7b31ab25-aa54-46b9-85ed-323d3757002c', {
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

testAPI(); 