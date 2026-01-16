-- CreateEnum
CREATE TYPE "SegmentStatus" AS ENUM ('PROCESSING', 'CREATED', 'FAILED');

-- AlterTable
ALTER TABLE "segments" ADD COLUMN "status" "SegmentStatus" NOT NULL DEFAULT 'PROCESSING';

-- CreateIndex
CREATE INDEX "segments_status_idx" ON "segments"("status");
