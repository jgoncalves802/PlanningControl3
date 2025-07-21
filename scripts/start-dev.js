const { spawn } = require('child_process');

console.log('🚀 Iniciando servidor de desenvolvimento...');

// Iniciar o servidor
const dev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Configurar para ignorar erros de lint
    NODE_ENV: 'development',
    ESLINT_NO_DEV_ERRORS: 'true'
  }
});

dev.on('close', (code) => {
  console.log(`✅ Servidor finalizado (código: ${code})`);
});

dev.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
}); 