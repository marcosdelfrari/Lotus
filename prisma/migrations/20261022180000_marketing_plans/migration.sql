-- CreateEnum
CREATE TYPE "MarketingPlanStatus" AS ENUM ('draft', 'saved');

-- CreateTable
CREATE TABLE "marketing_plans" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "analytics_company_id" TEXT NOT NULL,
    "operation_proposal" TEXT NOT NULL,
    "funnel_touchpoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "media_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ad_formats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "custom_assets" TEXT NOT NULL DEFAULT '',
    "status" "MarketingPlanStatus" NOT NULL DEFAULT 'saved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_plans_proposal_id_idx" ON "marketing_plans"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_plans_proposal_id_analytics_company_id_key" ON "marketing_plans"("proposal_id", "analytics_company_id");

-- AddForeignKey
ALTER TABLE "marketing_plans" ADD CONSTRAINT "marketing_plans_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "traffic_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
