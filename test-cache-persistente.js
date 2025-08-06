// Teste do cache persistente
console.log('=== Teste do Cache Persistente ===');

// Simular localStorage
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
    console.log(`✅ Salvo no localStorage: ${key} = ${value}`);
  },
  removeItem(key) {
    delete this.data[key];
    console.log(`🗑️ Removido do localStorage: ${key}`);
  }
};

// Substituir localStorage global para teste
global.localStorage = mockLocalStorage;

// Simular funções do cache
const CACHE_KEY = 'planning_control_user_cache';
const CACHE_TIMESTAMP_KEY = 'planning_control_user_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedUser = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) {
      console.log('❌ Cache não encontrado');
      return null;
    }
    
    const now = Date.now();
    const cacheTime = parseInt(timestamp);
    
    // Verificar se cache ainda é válido
    if (now - cacheTime > CACHE_DURATION) {
      console.log('⏰ Cache expirado, limpando...');
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    const user = JSON.parse(cached);
    console.log('✅ Cache válido encontrado:', user.name);
    return user;
  } catch (error) {
    console.error('❌ Erro ao ler cache:', error);
    return null;
  }
};

const setCachedUser = (user) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('💾 Usuário salvo no cache persistente');
  } catch (error) {
    console.error('❌ Erro ao salvar cache:', error);
  }
};

const clearCachedUser = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('🗑️ Cache limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }
};

// Testes
console.log('\n1. Teste - Cache vazio');
let user = getCachedUser();
console.log('Resultado:', user ? 'Usuário encontrado' : 'Cache vazio');

console.log('\n2. Teste - Salvar usuário no cache');
const testUser = {
  id: 'test-user-id',
  name: 'Usuário Teste',
  email: 'teste@example.com',
  role: 'SUPER_ADMIN',
  isActive: true,
  createdAt: new Date()
};
setCachedUser(testUser);

console.log('\n3. Teste - Recuperar usuário do cache');
user = getCachedUser();
console.log('Resultado:', user ? `Usuário: ${user.name}` : 'Cache vazio');

console.log('\n4. Teste - Limpar cache');
clearCachedUser();
user = getCachedUser();
console.log('Resultado após limpeza:', user ? 'Usuário encontrado' : 'Cache vazio');

console.log('\n5. Teste - Simular cache expirado');
setCachedUser(testUser);
// Simular timestamp antigo
localStorage.setItem(CACHE_TIMESTAMP_KEY, (Date.now() - CACHE_DURATION - 1000).toString());
user = getCachedUser();
console.log('Resultado com cache expirado:', user ? 'Usuário encontrado' : 'Cache expirado');

console.log('\n=== Teste Concluído ==='); 