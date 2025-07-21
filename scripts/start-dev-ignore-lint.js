const { spawn } = require('child_process');

console.log('🚀 Iniciando servidor de desenvolvimento...');

// Iniciar o servidor ignorando erros de lint
const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Ignorar erros de lint temporariamente
    ESLINT_NO_DEV_ERRORS: 'true'
  }
});

dev.on('close', (code) => {
  console.log(`✅ Servidor finalizado (código: ${code})`);
});

dev.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
}); 