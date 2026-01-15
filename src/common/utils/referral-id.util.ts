import { PrismaService } from '../../prisma.service';

/**
 * Generates a unique agent referral ID in format: AGT-XXXXX
 * where XXXXX is a random alphanumeric string (uppercase)
 */
export async function generateAgentReferralId(prisma: PrismaService): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomPart = generateRandomString(5);
    const referralId = `AGT-${randomPart}`;

    // Check if it already exists
    const existing = await prisma.admin.findUnique({
      where: { referralId },
    });

    if (!existing) {
      return referralId;
    }
  }

  throw new Error('Failed to generate unique agent referral ID after maximum attempts');
}

/**
 * Generates a partner referral ID in format: {agentReferralId}-P###
 * where ### is a sequential number per agent
 * Example: AGT-ABC12-P001, AGT-ABC12-P002, etc.
 *
 * @param prisma - Prisma service instance
 * @param agentId - The ID of the agent (Admin) who referred the clients
 */
export async function generatePartnerReferralId(
  prisma: PrismaService,
  agentId: string,
): Promise<string> {
  // Get the agent's referral ID
  const agent = await prisma.admin.findUnique({
    where: { id: agentId },
    select: { referralId: true },
  });

  if (!agent || !agent.referralId) {
    throw new Error('Agent or agent referral ID not found');
  }

  // Get the count of existing partners for this agent
  const existingPartners = await prisma.client.count({
    where: {
      referredByAgentId: agentId,
      referralId: {
        not: null,
      },
    },
  });

  // Next partner number (1-indexed)
  const partnerNumber = existingPartners + 1;
  const partnerSuffix = partnerNumber.toString().padStart(3, '0');

  return `${agent.referralId}-P${partnerSuffix}`;
}

/**
 * Extracts agent referral ID from partner referral ID
 * Example: AGT-ABC12-P001 -> AGT-ABC12
 */
export function extractAgentReferralId(partnerReferralId: string): string | null {
  const match = partnerReferralId.match(/^(AGT-[A-Z0-9]{5})-P\d{3}$/);
  return match ? match[1] : null;
}

/**
 * Generates a random alphanumeric string (uppercase)
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
