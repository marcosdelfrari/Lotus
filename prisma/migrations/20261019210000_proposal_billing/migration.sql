-- CreateEnum
CREATE TYPE "BillingItemKind" AS ENUM ('setup', 'monthly');

-- CreateEnum
CREATE TYPE "BillingItemStatus" AS ENUM ('pending', 'paid');

-- CreateTable
CREATE TABLE "proposal_billing_items" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "kind" "BillingItemKind" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "due_date" DATE,
    "status" "BillingItemStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_billing_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_billing_items_proposal_id_idx" ON "proposal_billing_items"("proposal_id");

-- CreateIndex
CREATE INDEX "proposal_billing_items_status_idx" ON "proposal_billing_items"("status");

-- AddForeignKey
ALTER TABLE "proposal_billing_items" ADD CONSTRAINT "proposal_billing_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "traffic_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
