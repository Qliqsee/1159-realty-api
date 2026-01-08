-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('NONE', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "partnerships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'NONE',
    "appliedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionCooldown" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partnerships_userId_key" ON "partnerships"("userId");

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
