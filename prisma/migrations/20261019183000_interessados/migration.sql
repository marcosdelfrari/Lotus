CREATE TABLE "interessados" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interessados_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "interessados_user_id_idx" ON "interessados"("user_id");
CREATE INDEX "interessados_created_at_idx" ON "interessados"("created_at");
