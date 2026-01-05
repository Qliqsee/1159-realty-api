import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const customerPermissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'properties:read',
        resource: 'properties',
        action: 'read',
        description: 'View properties',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'properties:create',
        resource: 'properties',
        action: 'create',
        description: 'Create property listings',
      },
    }),
  ]);

  const adminPermissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'View users',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'users:write',
        resource: 'users',
        action: 'write',
        description: 'Create and update users',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'users:delete',
        resource: 'users',
        action: 'delete',
        description: 'Delete users',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'roles:manage',
        resource: 'roles',
        action: 'manage',
        description: 'Manage roles and permissions',
      },
    }),
  ]);

  const customerRole = await prisma.role.create({
    data: {
      name: 'customer',
      appContext: 'client',
      description: 'Regular customer in client app',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      appContext: 'crm',
      description: 'Administrator in CRM',
    },
  });

  const supportRole = await prisma.role.create({
    data: {
      name: 'support',
      appContext: 'crm',
      description: 'Support staff in CRM',
    },
  });

  await Promise.all([
    ...customerPermissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: customerRole.id,
          permissionId: permission.id,
        },
      })
    ),
    ...adminPermissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    ),
    ...customerPermissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    ),
  ]);

  await prisma.rolePermission.create({
    data: {
      roleId: supportRole.id,
      permissionId: adminPermissions[0].id,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  await Promise.all([
    prisma.userRole.create({
      data: {
        userId: testUser.id,
        roleId: customerRole.id,
      },
    }),
    prisma.userRole.create({
      data: {
        userId: testUser.id,
        roleId: adminRole.id,
      },
    }),
  ]);

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: regularUser.id,
      roleId: customerRole.id,
    },
  });

  console.log('Seed completed successfully!');
  console.log('Test users:');
  console.log('  Admin: admin@example.com / password123 (has customer + admin roles)');
  console.log('  User: user@example.com / password123 (has customer role)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
