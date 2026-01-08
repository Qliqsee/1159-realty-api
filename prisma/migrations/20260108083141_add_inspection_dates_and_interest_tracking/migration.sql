/*
  Warnings:

  - Added the required column `updatedAt` to the `property_interests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "inspectionDates" TIMESTAMP(3)[];

-- AlterTable
ALTER TABLE "property_interests" ADD COLUMN     "agentId" TEXT,
ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "status" "InterestStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "property_interests_status_idx" ON "property_interests"("status");

-- CreateIndex
CREATE INDEX "property_interests_agentId_idx" ON "property_interests"("agentId");
