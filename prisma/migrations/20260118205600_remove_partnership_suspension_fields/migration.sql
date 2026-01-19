/*
  Warnings:

  - You are about to drop the column `suspendedAt` on the `partnerships` table. All the data in the column will be lost.
  - You are about to drop the column `suspendedBy` on the `partnerships` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "partnerships" DROP CONSTRAINT "partnerships_suspendedBy_fkey";

-- AlterTable
ALTER TABLE "partnerships" DROP COLUMN "suspendedAt",
DROP COLUMN "suspendedBy";
