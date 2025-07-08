const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Criando certificados HTTPS válidos...\n');

// Usar OpenSSL para criar certificados válidos
try {
  // Criar chave privada
  console.log('🔐 Gerando chave privada...');
  execSync('openssl genrsa -out localhost-key.pem 2048', { stdio: 'inherit' });
  
  // Criar certificado
  console.log('📜 Gerando certificado...');
  execSync('openssl req -new -x509 -key localhost-key.pem -out localhost.pem -days 365 -subj "/C=BR/ST=SP/L=SP/O=Dev/OU=Dev/CN=localhost"', { stdio: 'inherit' });
  
  console.log('✅ Certificados criados com sucesso!');
} catch (error) {
  console.log('⚠️  OpenSSL não disponível, usando abordagem alternativa...');
  
  // Usar mkcert via npx como última opção
  try {
    console.log('📦 Tentando mkcert...');
    execSync('npx -y mkcert@latest localhost', { stdio: 'inherit' });
    console.log('✅ Certificados mkcert criados!');
  } catch (mkcertError) {
    console.log('❌ Erro com mkcert também. Vamos usar HTTP normal.');
    console.log('💡 Para NFC, você precisará de HTTPS. Opções:');
    console.log('   1. Instalar OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   2. Usar ngrok: npx ngrok http 3000');
    console.log('   3. Deploy em produção com HTTPS automático');
    process.exit(1);
  }
}

console.log('\n🎉 Certificados prontos!');
console.log('🚀 Execute: npm run nfc:dev');
console.log('📱 Acesse: https://localhost:3001'); 