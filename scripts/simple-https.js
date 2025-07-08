const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Next.js com HTTPS...\n');

// Verificar se certificados existem
const certPath = path.join(__dirname, '..', 'localhost.pem');
const keyPath = path.join(__dirname, '..', 'localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('❌ Certificados não encontrados!');
  console.log('💡 Execute primeiro: npm run nfc:setup');
  process.exit(1);
}

// Configurar variáveis de ambiente para HTTPS
process.env.HTTPS = 'true';
process.env.SSL_CRT_FILE = certPath;
process.env.SSL_KEY_FILE = keyPath;

// Iniciar Next.js
const nextProcess = spawn('npx', ['next', 'dev', '--port', '3001'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    HTTPS: 'true',
    SSL_CRT_FILE: certPath,
    SSL_KEY_FILE: keyPath
  }
});

nextProcess.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

nextProcess.on('close', (code) => {
  console.log(`\n📋 Servidor finalizado com código ${code}`);
});

// Informações de uso
setTimeout(() => {
  console.log('\n📱 Para testar NFC:');
  console.log('   1. Acesse https://localhost:3001 no Chrome Android');
  console.log('   2. Aceite o certificado auto-assinado');
  console.log('   3. Ative NFC nas configurações do Android');
  console.log('   4. Navegue até /dashboard/nfc-management');
  console.log('   5. Clique em "Scan NFC" e aproxime o crachá');
  console.log('\n⚠️  IMPORTANTE: Funciona apenas no Chrome para Android com NFC ativo');
}, 3000); 