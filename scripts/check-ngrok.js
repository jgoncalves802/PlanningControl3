const https = require('https');
const http = require('http');

// Verificar se o ngrok está rodando
async function checkNgrokStatus() {
  try {
    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    
    if (data.tunnels && data.tunnels.length > 0) {
      const tunnel = data.tunnels[0];
      console.log('✅ Ngrok está rodando');
      console.log(`🌐 URL pública: ${tunnel.public_url}`);
      console.log(`🔗 URL local: ${tunnel.config.addr}`);
      
      // Testar a conectividade
      await testConnectivity(tunnel.public_url);
    } else {
      console.log('❌ Ngrok não está rodando ou não há túneis ativos');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar ngrok:', error.message);
  }
}

async function testConnectivity(url) {
  try {
    console.log(`\n🧪 Testando conectividade para: ${url}`);
    
    const response = await fetch(`${url}/api/health`);
    if (response.ok) {
      console.log('✅ Conectividade OK');
    } else {
      console.log(`⚠️ Resposta HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Erro de conectividade:', error.message);
  }
}

checkNgrokStatus(); 