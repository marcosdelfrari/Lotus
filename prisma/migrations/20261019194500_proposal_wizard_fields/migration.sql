-- AlterEnum
ALTER TYPE "ProposalStatus" ADD VALUE IF NOT EXISTS 'draft';

-- AlterTable
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "intro" TEXT NOT NULL DEFAULT '';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "setup_fee" INTEGER;
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "implementation_plan" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "terms" JSONB NOT NULL DEFAULT '[]';
