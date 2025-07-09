-- Remover a constraint de chave estrangeira se existir
ALTER TABLE nfc_badges DROP CONSTRAINT IF EXISTS "NFCBadge_assignedBy_fkey";
 
-- Alterar o campo para aceitar qualquer string (ID do Clerk)
ALTER TABLE nfc_badges ALTER COLUMN "assignedBy" TYPE TEXT; 