import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const customerPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'properties:read' },
      update: {},
      create: {
        name: 'properties:read',
        resource: 'properties',
        action: 'read',
        description: 'View properties',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'properties:create' },
      update: {},
      create: {
        name: 'properties:create',
        resource: 'properties',
        action: 'create',
        description: 'Create property listings',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kyc:view_own' },
      update: {},
      create: {
        name: 'kyc:view_own',
        resource: 'kyc',
        action: 'view_own',
        description: 'View own KYC information',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kyc:manage' },
      update: {},
      create: {
        name: 'kyc:manage',
        resource: 'kyc',
        action: 'manage',
        description: 'Create, update, and submit own KYC',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'partnership:apply' },
      update: {},
      create: {
        name: 'partnership:apply',
        resource: 'partnership',
        action: 'apply',
        description: 'Apply for partnership',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'partnership:view_own' },
      update: {},
      create: {
        name: 'partnership:view_own',
        resource: 'partnership',
        action: 'view_own',
        description: 'View own partnership status',
      },
    }),
  ]);

  const adminPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users:read' },
      update: {},
      create: {
        name: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'View users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:write' },
      update: {},
      create: {
        name: 'users:write',
        resource: 'users',
        action: 'write',
        description: 'Create and update users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users:delete' },
      update: {},
      create: {
        name: 'users:delete',
        resource: 'users',
        action: 'delete',
        description: 'Delete users',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'roles:manage' },
      update: {},
      create: {
        name: 'roles:manage',
        resource: 'roles',
        action: 'manage',
        description: 'Manage roles and permissions',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kyc:view_all' },
      update: {},
      create: {
        name: 'kyc:view_all',
        resource: 'kyc',
        action: 'view_all',
        description: 'View all KYC records',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'kyc:review' },
      update: {},
      create: {
        name: 'kyc:review',
        resource: 'kyc',
        action: 'review',
        description: 'Approve or reject KYC submissions',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'partnership:view_all' },
      update: {},
      create: {
        name: 'partnership:view_all',
        resource: 'partnership',
        action: 'view_all',
        description: 'View all partnership applications',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'partnership:review' },
      update: {},
      create: {
        name: 'partnership:review',
        resource: 'partnership',
        action: 'review',
        description: 'Approve or reject partnership applications',
      },
    }),
  ]);

  const customerRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'customer',
        appContext: 'client',
      },
    },
    update: {},
    create: {
      name: 'customer',
      appContext: 'client',
      description: 'Regular customer in client app',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'admin',
        appContext: 'crm',
      },
    },
    update: {},
    create: {
      name: 'admin',
      appContext: 'crm',
      description: 'Administrator in CRM',
    },
  });

  const supportRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'support',
        appContext: 'crm',
      },
    },
    update: {},
    create: {
      name: 'support',
      appContext: 'crm',
      description: 'Support staff in CRM',
    },
  });

  await Promise.all([
    ...customerPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: customerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: customerRole.id,
          permissionId: permission.id,
        },
      })
    ),
    ...adminPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    ),
    ...customerPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    ),
  ]);

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: supportRole.id,
        permissionId: adminPermissions[0].id,
      },
    },
    update: {},
    create: {
      roleId: supportRole.id,
      permissionId: adminPermissions[0].id,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  await Promise.all([
    prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: testUser.id,
          roleId: customerRole.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        roleId: customerRole.id,
      },
    }),
    prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: testUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: testUser.id,
        roleId: adminRole.id,
      },
    }),
  ]);

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: customerRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: customerRole.id,
    },
  });

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
    'Federal Capital Territory'
  ];

  await Promise.all(
    nigerianStates.map((name, index) =>
      prisma.state.upsert({
        where: { id: index + 1 },
        update: {},
        create: {
          id: index + 1,
          name,
        },
      })
    )
  );

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
