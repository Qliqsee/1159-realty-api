/*
  Warnings:

  - You are about to drop the column `name` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `accountName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `bankCode` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_leadId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropIndex
DROP INDEX "clients_leadId_key";

-- DropIndex
DROP INDEX "leads_clientId_key";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "otherName" TEXT;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "accountName",
DROP COLUMN "accountNumber",
DROP COLUMN "bankCode",
DROP COLUMN "bankName",
DROP COLUMN "leadId",
DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "otherName" TEXT;

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "clientId";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_resources" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "actions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resources_name_key" ON "resources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "actions_name_key" ON "actions"("name");

-- CreateIndex
CREATE INDEX "role_resources_roleId_idx" ON "role_resources"("roleId");

-- CreateIndex
CREATE INDEX "role_resources_resourceId_idx" ON "role_resources"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "role_resources_roleId_resourceId_key" ON "role_resources"("roleId", "resourceId");

-- AddForeignKey
ALTER TABLE "role_resources" ADD CONSTRAINT "role_resources_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_resources" ADD CONSTRAINT "role_resources_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
