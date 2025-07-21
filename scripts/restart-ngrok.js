const { spawn } = require('child_process');

console.log('🔄 Reiniciando ngrok...');

// Parar processos ngrok existentes
const killNgrok = spawn('taskkill', ['/f', '/im', 'ngrok.exe'], { 
  stdio: 'pipe',
  shell: true 
});

killNgrok.on('close', (code) => {
  console.log(`✅ Processos ngrok finalizados (código: ${code})`);
  
  // Aguardar um pouco e iniciar novo túnel
  setTimeout(() => {
    console.log('🚀 Iniciando novo túnel ngrok...');
    
    const ngrok = spawn('ngrok', ['http', '3001'], {
      stdio: 'pipe',
      shell: true
    });
    
    ngrok.stdout.on('data', (data) => {
      console.log(`📡 Ngrok: ${data.toString()}`);
    });
    
    ngrok.stderr.on('data', (data) => {
      console.log(`⚠️ Ngrok error: ${data.toString()}`);
    });
    
    ngrok.on('close', (code) => {
      console.log(`✅ Ngrok finalizado (código: ${code})`);
    });
    
    // Aguardar um pouco e verificar status
    setTimeout(() => {
      console.log('\n🔍 Verificando status do ngrok...');
      require('./check-ngrok.js');
    }, 3000);
    
  }, 2000);
}); 