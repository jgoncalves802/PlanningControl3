// Script para verificar o schema real da tabela user_roles
const { PrismaClient } = require('@prisma/client');

async function checkTableSchema() {
  const prisma = new PrismaClient();
  
  console.log('\n--- Verificando Schema da Tabela User Roles ---');
  console.log('===============================================\n');
  
  try {
    // 1. Verificar estrutura da tabela via SQL
    console.log('🔍 Verificando estrutura da tabela...');
    
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_roles' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Estrutura da tabela user_roles:');
    tableInfo.forEach(column => {
      console.log(`   ${column.column_name}: ${column.data_type} ${column.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${column.column_default ? `default: ${column.column_default}` : ''}`);
    });
    
    // 2. Verificar constraints existentes
    console.log('\n🔍 Verificando constraints existentes...');
    
    const constraints = await prisma.$queryRaw`
      SELECT 
        constraint_name,
        constraint_type,
        table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_roles'
    `;
    
    console.log('📋 Constraints da tabela:');
    if (constraints.length === 0) {
      console.log('   Nenhuma constraint encontrada');
    } else {
      constraints.forEach(constraint => {
        console.log(`   ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }
    
    // 3. Verificar índices existentes
    console.log('\n🔍 Verificando índices existentes...');
    
    const indexes = await prisma.$queryRaw`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'user_roles'
    `;
    
    console.log('📋 Índices da tabela:');
    if (indexes.length === 0) {
      console.log('   Nenhum índice encontrado');
    } else {
      indexes.forEach(index => {
        console.log(`   ${index.indexname}: ${index.indexdef}`);
      });
    }
    
    // 4. Verificar dados de exemplo
    console.log('\n🔍 Verificando dados de exemplo...');
    
    const sampleData = await prisma.$queryRaw`
      SELECT * FROM user_roles LIMIT 1
    `;
    
    if (sampleData.length > 0) {
      console.log('📋 Dados de exemplo:');
      const sample = sampleData[0];
      Object.keys(sample).forEach(key => {
        console.log(`   ${key}: ${sample[key]} (${typeof sample[key]})`);
      });
    } else {
      console.log('   Nenhum dado encontrado');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao verificar schema:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nScript finalizado.');
  }
}

checkTableSchema(); 