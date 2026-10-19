ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "client_email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "client_name" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "traffic_proposals_client_email_idx" ON "traffic_proposals"("client_email");
