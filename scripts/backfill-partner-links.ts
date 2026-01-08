import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generatePartnerLink(userId: string): string {
  const token = crypto.randomBytes(16).toString('hex');
  return `${token}-${userId.substring(0, 8)}`;
}

async function backfillPartnerLinks() {
  console.log('Starting partner link backfill...');

  // Find all approved partnerships where user doesn't have a partner link
  const approvedPartnerships = await prisma.partnership.findMany({
    where: {
      status: 'APPROVED',
      user: {
        partnerLink: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  console.log(`Found ${approvedPartnerships.length} approved partnerships without partner links`);

  if (approvedPartnerships.length === 0) {
    console.log('No backfill needed. All approved partners already have links.');
    return;
  }

  let successCount = 0;
  let errorCount = 0;

  for (const partnership of approvedPartnerships) {
    try {
      const partnerLink = generatePartnerLink(partnership.userId);

      await prisma.user.update({
        where: { id: partnership.userId },
        data: { partnerLink },
      });

      console.log(`✓ Generated link for ${partnership.user.email}: ${partnerLink}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to generate link for ${partnership.user.email}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n=== Backfill Summary ===');
  console.log(`Total processed: ${approvedPartnerships.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

backfillPartnerLinks()
  .catch((e) => {
    console.error('Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
