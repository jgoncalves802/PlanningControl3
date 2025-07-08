const { spawn } = require('child_process');

console.log('🌐 Configurando túnel HTTPS com Serveo...\n');

console.log('🚀 Iniciando Next.js...');

// Iniciar Next.js
const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: 'inherit',
  shell: true
});

// Aguardar Next.js iniciar
setTimeout(() => {
  console.log('\n🌐 Criando túnel HTTPS com Serveo...');
  console.log('💡 Execute em outro terminal:');
  console.log('   ssh -R 80:localhost:3000 serveo.net');
  console.log('\n📱 Ou use LocalTunnel:');
  console.log('   npm run nfc:localtunnel');
  console.log('\n📝 Ou configure ngrok (recomendado):');
  console.log('   1. Criar conta: https://dashboard.ngrok.com/signup');
  console.log('   2. Copiar token: https://dashboard.ngrok.com/get-started/your-authtoken');
  console.log('   3. npx ngrok config add-authtoken SEU_TOKEN');
  console.log('   4. npm run nfc:tunnel');

}, 3000);

// Cleanup ao sair
process.on('SIGINT', () => {
  console.log('\n🛑 Finalizando Next.js...');
  nextProcess.kill();
  process.exit();
});

nextProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar Next.js:', error);
  process.exit(1);
}); 