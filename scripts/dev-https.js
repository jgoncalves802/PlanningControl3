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
      console.log('❌ Certificados mkcert não encontrados!');
      console.log('💡 Execute os comandos:');
      console.log('   npm run mkcert:install');
      console.log('   npm run mkcert:create');
      console.log('   npm run dev:https');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao configurar HTTPS:', error.message);
    console.log('💡 Execute: npm run dev:setup');
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
      console.log('   2. Aceite o certificado se solicitado');
      console.log('   3. Ative NFC nas configurações');
      console.log('   4. Navegue até /dashboard/nfc-management');
      console.log('   5. Clique em "Scan NFC"');
    });
});

module.exports = { createServer }; 