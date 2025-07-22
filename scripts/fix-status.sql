-- Script para corrigir os status dos funcionários
-- Atualizar funcionários com status 'active' para 'ACTIVE'
UPDATE "Employee" 
SET status = 'ACTIVE' 
WHERE status = 'active';

-- Atualizar funcionários com status 'inactive' para 'DISMISSED'
UPDATE "Employee" 
SET status = 'DISMISSED' 
WHERE status = 'inactive';

-- Verificar os resultados
SELECT name, status, "isActive" FROM "Employee" ORDER BY name; 