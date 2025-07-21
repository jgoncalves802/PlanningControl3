const https = require('https');
const http = require('http');

async function testStaticFiles() {
  try {
    // Primeiro, testar o servidor local
    console.log('🧪 Testando servidor local...');
    const localResponse = await fetch('http://localhost:3000/_next/static/css/app/layout.css');
    console.log(`Local CSS status: ${localResponse.status}`);
    
    // Testar API local
    const localApiResponse = await fetch('http://localhost:3000/api/health');
    console.log(`Local API status: ${localApiResponse.status}`);
    
    // Agora testar via ngrok
    console.log('\n🧪 Testando via ngrok...');
    const ngrokResponse = await fetch('http://localhost:4040/api/tunnels');
    const tunnels = await ngrokResponse.json();
    
    if (tunnels.tunnels && tunnels.tunnels.length > 0) {
      const tunnelUrl = tunnels.tunnels[0].public_url;
      console.log(`🌐 URL do ngrok: ${tunnelUrl}`);
      
      // Testar CSS via ngrok
      try {
        const ngrokCssResponse = await fetch(`${tunnelUrl}/_next/static/css/app/layout.css`);
        console.log(`Ngrok CSS status: ${ngrokCssResponse.status}`);
      } catch (error) {
        console.log(`❌ Erro ao acessar CSS via ngrok: ${error.message}`);
      }
      
      // Testar API via ngrok
      try {
        const ngrokApiResponse = await fetch(`${tunnelUrl}/api/health`);
        console.log(`Ngrok API status: ${ngrokApiResponse.status}`);
      } catch (error) {
        console.log(`❌ Erro ao acessar API via ngrok: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testStaticFiles(); 