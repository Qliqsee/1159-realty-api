const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixClientRoles() {
  try {
    console.log('\n=== Fixing Client Roles ===\n');

    // Get the client role
    const clientRole = await prisma.role.findUnique({
      where: {
        name_appContext: { name: 'client', appContext: 'CLIENT' },
      },
      select: { id: true },
    });

    if (!clientRole) {
      console.log('❌ Client role not found in database!');
      return;
    }

    console.log(`✓ Found client role: ${clientRole.id}\n`);

    // Get all clients
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        user: {
          select: {
            email: true,
            userRoles: {
              select: {
                roleId: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${clients.length} clients in database\n`);

    let assigned = 0;
    let alreadyHasRole = 0;

    for (const client of clients) {
      // Check if user already has client role
      const hasClientRole = client.user.userRoles.some(
        (ur) => ur.roleId === clientRole.id
      );

      if (hasClientRole) {
        alreadyHasRole++;
        console.log(`⏭️  ${client.user.email} - Already has client role`);
      } else {
        // Assign client role
        await prisma.userRole.create({
          data: {
            userId: client.userId,
            roleId: clientRole.id,
          },
        });
        assigned++;
        console.log(`✅ ${client.user.email} - Client role assigned`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total clients: ${clients.length}`);
    console.log(`Already had role: ${alreadyHasRole}`);
    console.log(`Newly assigned: ${assigned}`);
    console.log('✓ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixClientRoles();
