-- Step 1: Add new column for referredByAgentId
ALTER TABLE "clients" ADD COLUMN "referredByAgentId" TEXT;

-- Step 2: Update referredByAgentId by matching agentReferralId with admins.referralId
UPDATE "clients" c
SET "referredByAgentId" = a.id
FROM "admins" a
WHERE c."agentReferralId" = a."referralId";

-- Step 3: Drop old agentReferralId column
ALTER TABLE "clients" DROP COLUMN "agentReferralId";

-- Step 4: Add foreign key constraint for referredByAgentId
ALTER TABLE "clients" ADD CONSTRAINT "clients_referredByAgentId_fkey" FOREIGN KEY ("referredByAgentId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
