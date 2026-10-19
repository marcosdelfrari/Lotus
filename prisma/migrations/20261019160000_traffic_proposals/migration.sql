CREATE TYPE "ProposalStatus" AS ENUM ('requested', 'sent', 'accepted', 'cancelled');

CREATE TABLE "traffic_proposals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT '',
    "monthly_media_budget" INTEGER,
    "goals" TEXT NOT NULL DEFAULT '',
    "contact_phone" TEXT NOT NULL DEFAULT '',
    "title" TEXT,
    "scope" JSONB NOT NULL DEFAULT '[]',
    "services" JSONB NOT NULL DEFAULT '[]',
    "ad_budget_suggestion" INTEGER,
    "deadline_days" INTEGER,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "valid_until" DATE,
    "status" "ProposalStatus" NOT NULL DEFAULT 'requested',
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "traffic_proposals_user_id_idx" ON "traffic_proposals"("user_id");
