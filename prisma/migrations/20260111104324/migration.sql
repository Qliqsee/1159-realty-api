/*
  Warnings:

  - You are about to drop the column `userId` on the `kyc` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `partnerships` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `property_interests` table. All the data in the column will be lost.
  - You are about to drop the column `closedBy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `hasCompletedOnboarding` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `referralSource` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[disbursementId]` on the table `commissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId]` on the table `kyc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId]` on the table `partnerships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceId,isActive]` on the table `payment_links` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[propertyId,clientId]` on the table `property_interests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientId` to the `kyc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `partnerships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `payment_links` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `property_interests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPENED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'BILLING', 'PROPERTY', 'ENROLLMENT', 'KYC', 'GENERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DisbursementType" AS ENUM ('COMMISSION', 'REFUND');

-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('PENDING', 'RELEASED', 'FAILED');

-- CreateEnum
CREATE TYPE "DisbursementConfigMode" AS ENUM ('ALL_EXCEPT', 'NONE_EXCEPT');

-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_agentId_fkey";

-- DropForeignKey
ALTER TABLE "commissions" DROP CONSTRAINT "commissions_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_agentId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_cancelledBy_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_clientId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "kyc" DROP CONSTRAINT "kyc_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "kyc" DROP CONSTRAINT "kyc_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "kyc" DROP CONSTRAINT "kyc_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "kyc" DROP CONSTRAINT "kyc_userId_fkey";

-- DropForeignKey
ALTER TABLE "kyc_history" DROP CONSTRAINT "kyc_history_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "kyc_rejection_reasons" DROP CONSTRAINT "kyc_rejection_reasons_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "lead_agent_history" DROP CONSTRAINT "lead_agent_history_agentId_fkey";

-- DropForeignKey
ALTER TABLE "lead_feedbacks" DROP CONSTRAINT "lead_feedbacks_agentId_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_addedBy_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_closedBy_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_reservedBy_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_statusChangedBy_fkey";

-- DropForeignKey
ALTER TABLE "partnerships" DROP CONSTRAINT "partnerships_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "partnerships" DROP CONSTRAINT "partnerships_userId_fkey";

-- DropForeignKey
ALTER TABLE "property_interests" DROP CONSTRAINT "property_interests_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_closedBy_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_leadId_fkey";

-- DropIndex
DROP INDEX "kyc_userId_key";

-- DropIndex
DROP INDEX "partnerships_userId_key";

-- DropIndex
DROP INDEX "property_interests_propertyId_userId_key";

-- DropIndex
DROP INDEX "users_leadId_key";

-- AlterTable
ALTER TABLE "commissions" ADD COLUMN     "disbursementId" TEXT;

-- AlterTable
ALTER TABLE "kyc" DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "partnerships" DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT;

-- AlterTable
ALTER TABLE "payment_links" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "paystackReference" TEXT,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ALTER COLUMN "expiresAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "property_interests" DROP COLUMN "userId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "closedBy",
DROP COLUMN "country",
DROP COLUMN "gender",
DROP COLUMN "hasCompletedOnboarding",
DROP COLUMN "leadId",
DROP COLUMN "name",
DROP COLUMN "referralSource",
DROP COLUMN "state",
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "accountName" TEXT,
    "bankName" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "canOnboardClients" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "gender" "Gender",
    "referralSource" TEXT,
    "country" TEXT,
    "state" TEXT,
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "partnerLink" TEXT,
    "referredByPartnerId" TEXT,
    "accountNumber" TEXT,
    "bankCode" TEXT,
    "accountName" TEXT,
    "bankName" TEXT,
    "leadId" TEXT,
    "closedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_targets" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "achievedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "achievedAmount" DECIMAL(15,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "message" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "clientId" TEXT,
    "propertyId" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_requirements" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_documents" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sample_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_documents" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requirement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "attachments" TEXT[],
    "status" "TicketStatus" NOT NULL DEFAULT 'OPENED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursements" (
    "id" TEXT NOT NULL,
    "type" "DisbursementType" NOT NULL,
    "commissionId" TEXT,
    "enrollmentId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'PENDING',
    "releaseDate" TIMESTAMP(3),
    "transferCode" TEXT,
    "transferReference" TEXT,
    "paystackResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "releasedBy" TEXT,

    CONSTRAINT "disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disbursement_configs" (
    "id" TEXT NOT NULL,
    "mode" "DisbursementConfigMode" NOT NULL,
    "exceptionUserIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disbursement_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gender" TEXT[],
    "properties" TEXT[],
    "countries" TEXT[],
    "states" TEXT[],
    "trafficSources" TEXT[],
    "agentIds" TEXT[],
    "partnerIds" TEXT[],
    "brevoListId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segment_exports" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "usersCount" INTEGER NOT NULL,
    "exportedBy" TEXT NOT NULL,
    "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,

    CONSTRAINT "segment_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_userId_key" ON "clients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_partnerLink_key" ON "clients"("partnerLink");

-- CreateIndex
CREATE UNIQUE INDEX "clients_leadId_key" ON "clients"("leadId");

-- CreateIndex
CREATE INDEX "sales_targets_adminId_idx" ON "sales_targets"("adminId");

-- CreateIndex
CREATE INDEX "sales_targets_startDate_endDate_idx" ON "sales_targets"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "sales_targets_createdBy_idx" ON "sales_targets"("createdBy");

-- CreateIndex
CREATE INDEX "achievements_adminId_idx" ON "achievements"("adminId");

-- CreateIndex
CREATE INDEX "achievements_startDate_endDate_idx" ON "achievements"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "schedules_propertyId_idx" ON "schedules"("propertyId");

-- CreateIndex
CREATE INDEX "schedules_dateTime_idx" ON "schedules"("dateTime");

-- CreateIndex
CREATE INDEX "schedules_createdBy_idx" ON "schedules"("createdBy");

-- CreateIndex
CREATE INDEX "appointments_scheduleId_idx" ON "appointments"("scheduleId");

-- CreateIndex
CREATE INDEX "appointments_propertyId_idx" ON "appointments"("propertyId");

-- CreateIndex
CREATE INDEX "appointments_clientId_idx" ON "appointments"("clientId");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_scheduleId_clientId_key" ON "appointments"("scheduleId", "clientId");

-- CreateIndex
CREATE INDEX "cases_clientId_idx" ON "cases"("clientId");

-- CreateIndex
CREATE INDEX "cases_propertyId_idx" ON "cases"("propertyId");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "case_requirements_caseId_idx" ON "case_requirements"("caseId");

-- CreateIndex
CREATE INDEX "sample_documents_requirementId_idx" ON "sample_documents"("requirementId");

-- CreateIndex
CREATE INDEX "requirement_documents_requirementId_idx" ON "requirement_documents"("requirementId");

-- CreateIndex
CREATE INDEX "requirement_documents_clientId_idx" ON "requirement_documents"("clientId");

-- CreateIndex
CREATE INDEX "requirement_documents_status_idx" ON "requirement_documents"("status");

-- CreateIndex
CREATE INDEX "requirement_documents_reviewedBy_idx" ON "requirement_documents"("reviewedBy");

-- CreateIndex
CREATE INDEX "support_tickets_clientId_idx" ON "support_tickets"("clientId");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE UNIQUE INDEX "disbursements_commissionId_key" ON "disbursements"("commissionId");

-- CreateIndex
CREATE INDEX "disbursements_type_idx" ON "disbursements"("type");

-- CreateIndex
CREATE INDEX "disbursements_status_idx" ON "disbursements"("status");

-- CreateIndex
CREATE INDEX "disbursements_recipientId_idx" ON "disbursements"("recipientId");

-- CreateIndex
CREATE INDEX "disbursements_enrollmentId_idx" ON "disbursements"("enrollmentId");

-- CreateIndex
CREATE INDEX "disbursements_commissionId_idx" ON "disbursements"("commissionId");

-- CreateIndex
CREATE INDEX "disbursements_createdAt_idx" ON "disbursements"("createdAt");

-- CreateIndex
CREATE INDEX "segments_createdBy_idx" ON "segments"("createdBy");

-- CreateIndex
CREATE INDEX "segments_createdAt_idx" ON "segments"("createdAt");

-- CreateIndex
CREATE INDEX "segment_exports_segmentId_idx" ON "segment_exports"("segmentId");

-- CreateIndex
CREATE INDEX "segment_exports_exportedBy_idx" ON "segment_exports"("exportedBy");

-- CreateIndex
CREATE INDEX "segment_exports_exportedAt_idx" ON "segment_exports"("exportedAt");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_disbursementId_key" ON "commissions"("disbursementId");

-- CreateIndex
CREATE INDEX "commissions_disbursementId_idx" ON "commissions"("disbursementId");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_clientId_key" ON "kyc"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "partnerships_clientId_key" ON "partnerships"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_invoiceId_isActive_key" ON "payment_links"("invoiceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "property_interests_propertyId_clientId_key" ON "property_interests"("propertyId", "clientId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_referredByPartnerId_fkey" FOREIGN KEY ("referredByPartnerId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc" ADD CONSTRAINT "kyc_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_rejection_reasons" ADD CONSTRAINT "kyc_rejection_reasons_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_history" ADD CONSTRAINT "kyc_history_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_interests" ADD CONSTRAINT "property_interests_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_reservedBy_fkey" FOREIGN KEY ("reservedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_statusChangedBy_fkey" FOREIGN KEY ("statusChangedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_feedbacks" ADD CONSTRAINT "lead_feedbacks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_agent_history" ADD CONSTRAINT "lead_agent_history_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partnerships" ADD CONSTRAINT "partnerships_suspendedBy_fkey" FOREIGN KEY ("suspendedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_disbursementId_fkey" FOREIGN KEY ("disbursementId") REFERENCES "disbursements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_targets" ADD CONSTRAINT "sales_targets_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_targets" ADD CONSTRAINT "sales_targets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_requirements" ADD CONSTRAINT "case_requirements_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sample_documents" ADD CONSTRAINT "sample_documents_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "case_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "case_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_documents" ADD CONSTRAINT "requirement_documents_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disbursements" ADD CONSTRAINT "disbursements_releasedBy_fkey" FOREIGN KEY ("releasedBy") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segments" ADD CONSTRAINT "segments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_exports" ADD CONSTRAINT "segment_exports_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segment_exports" ADD CONSTRAINT "segment_exports_exportedBy_fkey" FOREIGN KEY ("exportedBy") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
