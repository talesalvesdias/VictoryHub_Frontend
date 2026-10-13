-- CreateTable
CREATE TABLE "ChatUsage" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatUsage_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateIndex
CREATE INDEX "ChatUsage_windowStart_idx" ON "ChatUsage"("windowStart");

