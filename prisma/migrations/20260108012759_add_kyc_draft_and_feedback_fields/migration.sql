-- AlterTable
ALTER TABLE "kyc" ADD COLUMN     "addressDraft" JSONB,
ADD COLUMN     "bankDraft" JSONB,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "identityDraft" JSONB,
ADD COLUMN     "lastSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "nextOfKinDraft" JSONB,
ADD COLUMN     "occupationDraft" JSONB,
ADD COLUMN     "personalDraft" JSONB;

-- AlterTable
ALTER TABLE "kyc_history" ADD COLUMN     "feedback" TEXT;
