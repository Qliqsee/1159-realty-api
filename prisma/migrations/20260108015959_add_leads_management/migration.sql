-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'CLOSED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "leadId" TEXT,
ADD COLUMN "closedBy" TEXT,
ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'AVAILABLE',
    "reservedBy" TEXT,
    "reservationExpiresAt" TIMESTAMP(3),
    "addedBy" TEXT NOT NULL,
    "closedBy" TEXT,
    "clientId" TEXT,
    "statusChangedAt" TIMESTAMP(3),
    "statusChangedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_feedbacks" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_agent_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "lead_agent_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_leadId_key" ON "users"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_clientId_key" ON "leads"("clientId");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_reservedBy_idx" ON "leads"("reservedBy");

-- CreateIndex
CREATE INDEX "leads_addedBy_idx" ON "leads"("addedBy");

-- CreateIndex
CREATE INDEX "lead_feedbacks_leadId_idx" ON "lead_feedbacks"("leadId");

-- CreateIndex
CREATE INDEX "lead_feedbacks_agentId_idx" ON "lead_feedbacks"("agentId");

-- CreateIndex
CREATE INDEX "lead_agent_history_leadId_idx" ON "lead_agent_history"("leadId");

-- CreateIndex
CREATE INDEX "lead_agent_history_agentId_idx" ON "lead_agent_history"("agentId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_reservedBy_fkey" FOREIGN KEY ("reservedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_statusChangedBy_fkey" FOREIGN KEY ("statusChangedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_feedbacks" ADD CONSTRAINT "lead_feedbacks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_feedbacks" ADD CONSTRAINT "lead_feedbacks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_agent_history" ADD CONSTRAINT "lead_agent_history_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_agent_history" ADD CONSTRAINT "lead_agent_history_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
