import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Function to generate unique agent referral ID
async function generateAgentReferralId(): Promise<string> {
  const maxAttempts = 10;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
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

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Nigerian States
  const nigerianStates = [
    { id: 1, name: 'Abia', capital: 'Umuahia' },
    { id: 2, name: 'Adamawa', capital: 'Yola' },
    { id: 3, name: 'Akwa Ibom', capital: 'Uyo' },
    { id: 4, name: 'Anambra', capital: 'Awka' },
    { id: 5, name: 'Bauchi', capital: 'Bauchi' },
    { id: 6, name: 'Bayelsa', capital: 'Yenagoa' },
    { id: 7, name: 'Benue', capital: 'Makurdi' },
    { id: 8, name: 'Borno', capital: 'Maiduguri' },
    { id: 9, name: 'Cross River', capital: 'Calabar' },
    { id: 10, name: 'Delta', capital: 'Asaba' },
    { id: 11, name: 'Ebonyi', capital: 'Abakaliki' },
    { id: 12, name: 'Edo', capital: 'Benin City' },
    { id: 13, name: 'Ekiti', capital: 'Ado Ekiti' },
    { id: 14, name: 'Enugu', capital: 'Enugu' },
    { id: 15, name: 'Gombe', capital: 'Gombe' },
    { id: 16, name: 'Imo', capital: 'Owerri' },
    { id: 17, name: 'Jigawa', capital: 'Dutse' },
    { id: 18, name: 'Kaduna', capital: 'Kaduna' },
    { id: 19, name: 'Kano', capital: 'Kano' },
    { id: 20, name: 'Katsina', capital: 'Katsina' },
    { id: 21, name: 'Kebbi', capital: 'Birnin Kebbi' },
    { id: 22, name: 'Kogi', capital: 'Lokoja' },
    { id: 23, name: 'Kwara', capital: 'Ilorin' },
    { id: 24, name: 'Lagos', capital: 'Ikeja' },
    { id: 25, name: 'Nasarawa', capital: 'Lafia' },
    { id: 26, name: 'Niger', capital: 'Minna' },
    { id: 27, name: 'Ogun', capital: 'Abeokuta' },
    { id: 28, name: 'Ondo', capital: 'Akure' },
    { id: 29, name: 'Osun', capital: 'Osogbo' },
    { id: 30, name: 'Oyo', capital: 'Ibadan' },
    { id: 31, name: 'Plateau', capital: 'Jos' },
    { id: 32, name: 'Rivers', capital: 'Port Harcourt' },
    { id: 33, name: 'Sokoto', capital: 'Sokoto' },
    { id: 34, name: 'Taraba', capital: 'Jalingo' },
    { id: 35, name: 'Yobe', capital: 'Damaturu' },
    { id: 36, name: 'Zamfara', capital: 'Gusau' },
    { id: 37, name: 'FCT', capital: 'Abuja' },
  ];

  for (const state of nigerianStates) {
    await prisma.state.upsert({
      where: { id: state.id },
      update: { name: state.name, capital: state.capital },
      create: { id: state.id, name: state.name, capital: state.capital },
    });
  }
  console.log(`✅ Seeded ${nigerianStates.length} Nigerian states`);

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

    // Generate unique referral ID for admin
    const referralId = await generateAgentReferralId();

    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        firstName: 'Super',
        lastName: 'Admin',
        referralId,
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

    console.log(`✅ Default admin user created: admin@example.com / password123 (Referral ID: ${referralId})`);
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
