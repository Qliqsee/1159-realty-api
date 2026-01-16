-- AlterTable: Change states column from String[] to Int[]
ALTER TABLE "segments" ALTER COLUMN "states" TYPE integer[] USING "states"::text[]::integer[];

-- AlterTable: Add spending filter columns
ALTER TABLE "segments" ADD COLUMN "minTotalSpent" DECIMAL(15,2);
ALTER TABLE "segments" ADD COLUMN "maxTotalSpent" DECIMAL(15,2);
