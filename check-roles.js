const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    console.log('\n=== Checking Roles in Database ===\n');

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        appContext: true,
        description: true,
      },
    });

    console.log(`Found ${roles.length} roles:\n`);
    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name} (appContext: ${role.appContext})`);
      console.log(`   ID: ${role.id}`);
      if (role.description) {
        console.log(`   Description: ${role.description}`);
      }
      console.log('');
    });

    // Check specifically for client role
    const clientRole = await prisma.role.findUnique({
      where: {
        name_appContext: { name: 'client', appContext: 'SYSTEM' },
      },
    });

    console.log('=== Client Role Check ===');
    console.log(`Looking for: name='client', appContext='SYSTEM'`);
    console.log(`Result: ${clientRole ? 'FOUND ✓' : 'NOT FOUND ✗'}\n`);

    if (!clientRole) {
      console.log('⚠️  The "client" role with appContext "SYSTEM" does not exist!');
      console.log('This is why role assignment is failing during signup.\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
