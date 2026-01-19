-- AlterTable
ALTER TABLE "kyc_history" ADD COLUMN     "addressStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "bankStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "identityStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "nextOfKinStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "occupationStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "personalStatus" "KycStatus" NOT NULL DEFAULT 'DRAFT';
