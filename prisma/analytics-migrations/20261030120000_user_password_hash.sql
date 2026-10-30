-- Coluna opcional: contas Google/legado continuam sem senha.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
