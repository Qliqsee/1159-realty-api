-- CreateEnum
CREATE TYPE "TrafficSource" AS ENUM ('X', 'INSTAGRAM', 'REFERRAL', 'YOUTUBE', 'TIKTOK', 'WHATSAPP', 'TELEGRAM', 'SEARCH_ENGINE', 'OTHERS');

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "referralSource",
ADD COLUMN "referralSource" "TrafficSource";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN "source" "TrafficSource";

-- AlterTable
ALTER TABLE "segments" DROP COLUMN "trafficSources",
ADD COLUMN "trafficSources" "TrafficSource"[] DEFAULT ARRAY[]::"TrafficSource"[];
