const fs = require('fs');
const path = require('path');

// Ler o arquivo mock-data.ts
const filePath = path.join(__dirname, '../lib/mock-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Substituir todas as referências ao UserRole antigo
const replacements = [
  { from: 'UserRole.SAFETY', to: "'COMPANY_ADMIN' as UserRole" },
  { from: 'UserRole.TENANT_ADMIN', to: "'COMPANY_ADMIN' as UserRole" },
  { from: 'UserRole.CONTRACT_MANAGER', to: "'COMPANY_ADMIN' as UserRole" },
  { from: 'UserRole.HR', to: "'COMPANY_ADMIN' as UserRole" },
  { from: 'UserRole.PLANNING', to: "'COMPANY_ADMIN' as UserRole" },
  { from: 'UserRole.SUPERVISOR', to: "'USER' as UserRole" },
  { from: 'UserRole.OPERATOR', to: "'USER' as UserRole" }
];

replacements.forEach(replacement => {
  content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
});

// Escrever o arquivo atualizado
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Referências ao UserRole antigo corrigidas em mock-data.ts'); 