const https = require('https');
const fs = require('fs');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3001;

console.log('🚀 Iniciando servidor HTTPS...\n');

// Verificar certificados
if (!fs.existsSync('localhost.pem') || !fs.existsSync('localhost-key.pem')) {
  console.log('❌ Certificados não encontrados!');
  console.log('💡 Execute: node scripts/create-cert.js');
  process.exit(1);
}

// Configurar Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  };

  const server = https.createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`✅ Servidor HTTPS rodando em https://${hostname}:${port}`);
    console.log('\n📱 Para testar NFC no Android:');
    console.log('   1. Conecte o celular na mesma rede WiFi');
    console.log('   2. Descubra o IP do PC: ipconfig');
    console.log('   3. Acesse https://SEU_IP:3001 no Chrome Android');
    console.log('   4. Aceite o certificado auto-assinado');
    console.log('   5. Ative NFC e vá para /dashboard/nfc-management');
    console.log('\n⚠️  IMPORTANTE: Aceite o certificado quando solicitado!');
  });
}); 