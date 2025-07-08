const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

// Configuração do Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Certificados para HTTPS local
  let httpsOptions = {};
  
  try {
    // Tentar usar certificados mkcert se existirem
    const certPath = path.join(__dirname, '..', 'localhost.pem');
    const keyPath = path.join(__dirname, '..', 'localhost-key.pem');
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
      console.log('📋 Usando certificados mkcert existentes');
    } else {
      // Certificado auto-assinado básico
      httpsOptions = {
        key: generateSelfSignedKey(),
        cert: generateSelfSignedCert(),
      };
      console.log('⚠️  Usando certificado auto-assinado (não recomendado para produção)');
    }
  } catch (error) {
    console.error('❌ Erro ao configurar HTTPS:', error.message);
    console.log('💡 Execute: npm install -g mkcert && mkcert localhost');
    process.exit(1);
  }

  // Criar servidor HTTPS
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error('❌ Erro no servidor HTTPS:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Servidor HTTPS rodando em https://${hostname}:${port}`);
      console.log('📱 Para testar NFC:');
      console.log('   1. Acesse no Chrome Android');
      console.log('   2. Aceite o certificado auto-assinado');
      console.log('   3. Ative NFC nas configurações');
      console.log('   4. Navegue até /dashboard/nfc-management');
    });
});

// Funções para certificado auto-assinado (básico)
function generateSelfSignedKey() {
  // Esta é uma implementação básica - use mkcert para produção
  return `-----BEGIN PRIVATE KEY-----
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
GvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQKBgH5FjGvQqXrWkrj9XkjvgqJ
GANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkr
j9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5Fj
GvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5
o+kfVH5FjGvQKBgQDqVTLCWHvdTgtHtCxjZcXjyQw3TQ5r5VH5FjGvQqXrWkrj9Xk
jvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQq
XrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kf
VH5FjGvQqXrWkrj9XkjvgqJGANpfS8QW5o+kfVH5FjGvQ==
-----END PRIVATE KEY-----`;
}

function generateSelfSignedCert() {
  // Esta é uma implementação básica - use mkcert para produção
  return `-----BEGIN CERTIFICATE-----
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
}

module.exports = { createServer }; 