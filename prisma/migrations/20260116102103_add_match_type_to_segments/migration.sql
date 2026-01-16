-- AlterTable: Add matchType column to segments
ALTER TABLE "segments" ADD COLUMN "matchType" TEXT NOT NULL DEFAULT 'ALL';
