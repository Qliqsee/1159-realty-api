-- AlterTable
ALTER TABLE "admins" ADD COLUMN "referralId" TEXT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "partnerLink",
ADD COLUMN "referralId" TEXT,
ADD COLUMN "agentReferralId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "admins_referralId_key" ON "admins"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_referralId_key" ON "clients"("referralId");
