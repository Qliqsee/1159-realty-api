/*
  Warnings:

  - You are about to drop the column `agentIds` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `countries` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `maxTotalSpent` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `minTotalSpent` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `partnerIds` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `properties` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `states` on the `segments` table. All the data in the column will be lost.
  - You are about to drop the column `trafficSources` on the `segments` table. All the data in the column will be lost.
  - Added the required column `conditions` to the `segments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "segments" DROP COLUMN "agentIds",
DROP COLUMN "countries",
DROP COLUMN "gender",
DROP COLUMN "maxTotalSpent",
DROP COLUMN "minTotalSpent",
DROP COLUMN "partnerIds",
DROP COLUMN "properties",
DROP COLUMN "states",
DROP COLUMN "trafficSources",
ADD COLUMN     "conditions" JSONB NOT NULL;
