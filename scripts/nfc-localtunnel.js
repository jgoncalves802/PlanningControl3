const { spawn } = require('child_process');
const { execSync } = require('child_process');

console.log('🌐 Configurando túnel HTTPS com LocalTunnel...\n');

console.log('🚀 Iniciando Next.js...');

// Iniciar Next.js em uma porta específica
const nextProcess = spawn('npx', ['next', 'dev', '--port', '3000'], {
  stdio: 'inherit',
  shell: true
});

// Aguardar alguns segundos para o Next.js iniciar
setTimeout(() => {
  console.log('\n🌐 Criando túnel HTTPS com LocalTunnel...');
  
  // Iniciar localtunnel
  const tunnelProcess = spawn('npx', ['localtunnel', '--port', '3000'], {
    stdio: 'inherit', 
    shell: true
  });

  console.log('\n📱 INSTRUÇÕES PARA TESTAR NFC:');
  console.log('   1. Aguarde o LocalTunnel mostrar a URL HTTPS');
  console.log('   2. Copie a URL que termina com .loca.lt');
  console.log('   3. Acesse a URL no Chrome Android');
  console.log('   4. Navegue para /dashboard/nfc-management');
  console.log('   5. Ative NFC no Android e clique em "Scan NFC"');
  console.log('\n✅ LocalTunnel não precisa de conta!');

  // Cleanup ao sair
  process.on('SIGINT', () => {
    console.log('\n🛑 Finalizando serviços...');
    nextProcess.kill();
    tunnelProcess.kill();
    process.exit();
  });

}, 5000);

// Cleanup se Next.js falhar
nextProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar Next.js:', error);
  process.exit(1);
}); 