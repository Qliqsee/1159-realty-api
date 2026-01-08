/*
  Warnings:

  - You are about to drop the column `enrollments` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `sold` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `properties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "enrollments",
DROP COLUMN "interests",
DROP COLUMN "sold",
DROP COLUMN "views";

-- CreateTable
CREATE TABLE "property_interests" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_interests_propertyId_userId_key" ON "property_interests"("propertyId", "userId");

-- AddForeignKey
ALTER TABLE "property_interests" ADD CONSTRAINT "property_interests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_interests" ADD CONSTRAINT "property_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
