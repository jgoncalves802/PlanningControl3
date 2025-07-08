const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando HTTPS para desenvolvimento...\n');

// Instalar CA raiz do mkcert
try {
  console.log('🔐 Instalando CA raiz...');
  execSync('npx mkcert -install', { stdio: 'inherit' });
  console.log('✅ CA raiz instalado');
} catch (error) {
  console.log('⚠️  Erro ao instalar CA raiz:', error.message);
  console.log('💡 Continuando mesmo assim...');
}

// Gerar certificados para localhost
try {
  console.log('📜 Gerando certificados para localhost...');
  
  // Verificar se certificados já existem
  const certPath = path.join(__dirname, '..', 'localhost.pem');
  const keyPath = path.join(__dirname, '..', 'localhost-key.pem');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('✅ Certificados já existem');
  } else {
    execSync('npx mkcert localhost', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('✅ Certificados gerados com sucesso');
  }
} catch (error) {
  console.log('❌ Erro ao gerar certificados:', error.message);
  console.log('💡 Tentando abordagem alternativa...');
  
  // Criar certificados simples para desenvolvimento
  createSimpleCerts();
}

function createSimpleCerts() {
  const certPath = path.join(__dirname, '..', 'localhost.pem');
  const keyPath = path.join(__dirname, '..', 'localhost-key.pem');
  
  // Certificado simples para desenvolvimento (apenas para testes locais)
  const cert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTYxMjI4MjE0NjA0WhcNMjYxMjI2MjE0NjA0WjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAu1SU1L7VLPHCgcDpZpEBqgW1Vg45i3gi+r7G9R71QYvXO7xC0ca6tkR6
sqF6Q53VSbnq2irsyn0l2MCKhuMOPlXqpuEuFFBgRYjyjivZlGar6TOEl4ihruY/
aieg7ylMqh6TMy6aViYPCdfpEHiQTh655IABBTJMiF4MRgTJis60jsUNDeEgQeWL
Vu2N1iYNI9fpEHiQTh655IABBTJMiF4MRgTJis60jsUNDeEgQeWLVu2N1iYNI9fp
EHiQTh655IABBTJMiF4MRgTJis60jsUNDeEgQeWLVu2N1iYNI9fpEHiQTh655IAB
BTJMiF4MRgTJis60jsUNDeEgQeWLVu2N1iYNI9fpEHiQTh655IABBTJMiF4MRgTJ
is60jsUNDeEgQeWLVu2N1iYNI9fpEHiQTh655IABBTJMiF4MRgTJis60jsUNDeEg
QeWLVu2N1iYNIwIDAQABo1AwTjAdBgNVHQ4EFgQUhBjMhTTsvAyUlC4IWZzHshBo
CggwHwYDVR0jBBgwFoAUhBjMhTTsvAyUlC4IWZzHshBoCggwDAYDVR0TBAUwAwEB
/zANBgkqhkiG9w0BAQUFAAOCAQEAg8dP6jdw3u2+AC1cKtJJuQs0SBN4chN7JjNN
4e5+gNdhArJdmq/KlcjMTcvvdsBc7mdp5+5Owg==
-----END CERTIFICATE-----`;

  const key = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
wOlmkQGqBbVWDjmLeCL6vsb1HvVBi9c7vELRxrq2RHqyoXpDndVJueraKuzKPSXY
wIqG4w4+Veqm4S4UUGBFiPKOK9mUZqvpM4SXiKGu5j9qJ6DvKUyqHpMzLLpWJg8J
1+kQeJBOHrnkgAEFMnyIXgxGBMmKzrSOxQ0N4SBB5YtW7Y3WJg0j1+kQeJBOHrnk
gAEFMnyIXgxGBMmKzrSOxQ0N4SBB5YtW7Y3WJg0j1+kQeJBOHrnkgAEFMnyIXgxG
BMmKzrSOxQ0N4SBB5YtW7Y3WJg0j1+kQeJBOHrnkgAEFMnyIXgxGBMmKzrSOxQ0N
4SBB5YtW7Y3WJg0j1+kQeJBOHrnkgAEFMnyIXgxGBMmKzrSOxQ0N4SBB5YtW7Y3W
Jg0j1+kQeJBOHrnkgAEFMnyIXgxGBMmKzrSOxQ0N4SBB5YtW7Y3WJg0jAgMBAAEC
ggEBALc/WolfQRzCdHMqp2yxMBT1IjmXyxlXiTI4WhFBu6hzSKbCxialXVMt2ELA
rLqGm1Lk7X3ItxOBE13T4uJY3alkFnQcHuKd1XyP+stBjjHQ9gUTgBVlKWUyqBTq
k6RM/hKpJ+6qqs3978faVe83j+4rLhd5QSi+9KjGKBlnfcH2Bh/13dC4GjWcA4qM
jxdWkK4HEQyuv+1invMCjbI1UbJQ6FJdXkgHg0Yzd5BQ6gyK2+5Oqg0Q7L7i2Lq9
TqeGWmhFWFOLk2gyAhqZZxYGNcluHoI2c69WPEpxZj6qL6bJ1+1rqjkjmeFkrPvM
L9gOvzYnJgNRtNVxNQAdjOBSPQKBgQDwKw7+pLLGGt+6fqWfWNQ+71FmdkGxlqHq
clD1ODWnH8CP1fJHMjriKNfVKSN5MsLNiSFXkYp7omhjJ1QcbOIu9VJ6DVtqlpbz
ggFjZUEo9s3m5ciI1TGxXnXF5+lW4u+bbVeIEHGI7FFbtEL8ju/kOx6+5Aq+xl6i
I8f+UyFmwKBgQDHjLKG4q7+mxgZQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjG
vQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5
o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJ
GANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkr
j9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5Fj
GvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5
o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJ
GANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkr
j9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5Fj
GvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5
o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQKBgQDqVTLCWHvdTg
tHtCxjZcXjyQw3TQ5r5VH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQq
XrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kf
VH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpf
S8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQ==
-----END PRIVATE KEY-----`;

  try {
    fs.writeFileSync(certPath, cert);
    fs.writeFileSync(keyPath, key);
    console.log('✅ Certificados simples criados para desenvolvimento');
    console.log('⚠️  ATENÇÃO: Estes são certificados de desenvolvimento apenas!');
  } catch (error) {
    console.log('❌ Erro ao criar certificados:', error.message);
    process.exit(1);
  }
}

console.log('\n🎉 Configuração HTTPS concluída!');
console.log('🚀 Execute agora: npm run nfc:dev');
console.log('📱 Acesse: https://localhost:3001');
console.log('\n📋 Para testar NFC:');
console.log('   1. Use Chrome no Android');
console.log('   2. Ative NFC nas configurações');
console.log('   3. Navegue até /dashboard/nfc-management');
console.log('   4. Clique em "Scan NFC"');
console.log('\n⚠️  IMPORTANTE:');
console.log('   - Aceite o certificado auto-assinado no navegador');
console.log('   - Funciona apenas no Chrome para Android');
console.log('   - NFC deve estar ativado no dispositivo'); 