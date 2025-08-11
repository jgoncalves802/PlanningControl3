-- Migration: Add unique constraint to user_roles table
-- Date: 2025-08-11 14:30:00

-- Primeiro, remover registros duplicados mantendo apenas o mais recente
DELETE FROM user_roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (userId, role) id
  FROM user_roles
  ORDER BY userId, role, updatedAt DESC
);

-- Adicionar constraint única
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_userId_role_key UNIQUE (userId, role);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_roles_userId_role ON user_roles(userId, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_isActive ON user_roles(isActive); 