import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Load permissions map
  const permissionsMapPath = path.join(__dirname, '../permissions-map.json');
  const permissionsMap = JSON.parse(fs.readFileSync(permissionsMapPath, 'utf-8'));

  // 1. Seed Roles
  const roleNames = Object.keys(permissionsMap);
  const clientRoles = ['client', 'partner'];
  const allRoles = [...roleNames, ...clientRoles];

  for (const roleName of allRoles) {
    const appContext = clientRoles.includes(roleName) ? 'CLIENT' : 'SYSTEM';
    await prisma.role.upsert({
      where: { name_appContext: { name: roleName, appContext } },
      update: {},
      create: { name: roleName, appContext, description: `${roleName} role` },
    });
  }
  console.log(`✅ Seeded ${allRoles.length} roles`);

  // 2. Extract and seed all unique resources
  const resourceSet = new Set<string>();
  for (const rolePerms of Object.values(permissionsMap)) {
    Object.keys(rolePerms as Record<string, string[]>).forEach(res => resourceSet.add(res));
  }
  const resources = Array.from(resourceSet);

  for (const resourceName of resources) {
    await prisma.resource.upsert({
      where: { name: resourceName },
      update: {},
      create: { name: resourceName, description: `${resourceName} resource` },
    });
  }
  console.log(`✅ Seeded ${resources.length} resources`);

  // 3. Extract and seed all unique actions
  const actionSet = new Set<string>();
  for (const rolePerms of Object.values(permissionsMap)) {
    for (const actions of Object.values(rolePerms as Record<string, string[]>)) {
      (actions as string[]).forEach(action => {
        if (action && action.length > 0) {
          actionSet.add(action);
        }
      });
    }
  }
  const actions = Array.from(actionSet).filter(a => a.length > 0);

  for (const actionName of actions) {
    await prisma.action.upsert({
      where: { name: actionName },
      update: {},
      create: { name: actionName, description: `${actionName} action` },
    });
  }
  console.log(`✅ Seeded ${actions.length} actions`);

  // 4. Seed role-resource-actions mappings
  let mappingCount = 0;
  for (const [roleName, resources] of Object.entries(permissionsMap)) {
    const role = await prisma.role.findUnique({
      where: { name_appContext: { name: roleName, appContext: 'SYSTEM' } },
    });

    if (!role) continue;

    for (const [resourceName, actions] of Object.entries(resources as Record<string, string[]>)) {
      const resource = await prisma.resource.findUnique({
        where: { name: resourceName },
      });

      if (!resource) continue;

      const actionsList = (actions as string[]).filter(a => a && a.length > 0);
      if (actionsList.length === 0) continue;

      await prisma.roleResource.upsert({
        where: { roleId_resourceId: { roleId: role.id, resourceId: resource.id } },
        update: { actions: actionsList },
        create: { roleId: role.id, resourceId: resource.id, actions: actionsList },
      });
      mappingCount++;
    }
  }
  console.log(`✅ Seeded ${mappingCount} role-resource mappings`);

  // ========== CREATE DEFAULT ADMIN USER ==========
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        isEmailVerified: true,
      },
    });

    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        firstName: 'Super',
        lastName: 'Admin',
      },
    });

    const adminRole = await prisma.role.findUnique({
      where: { name_appContext: { name: 'admin', appContext: 'SYSTEM' } },
    });

    if (adminRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });
    }

    console.log('✅ Default admin user created: admin@example.com / password123');
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
