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

  // Enrollment permissions
  const enrollmentPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'enrollment:create' },
      update: {},
      create: {
        name: 'enrollment:create',
        resource: 'enrollment',
        action: 'create',
        description: 'Create new enrollment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:read' },
      update: {},
      create: {
        name: 'enrollment:read',
        resource: 'enrollment',
        action: 'read',
        description: 'View enrollments list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:read-own' },
      update: {},
      create: {
        name: 'enrollment:read-own',
        resource: 'enrollment',
        action: 'read-own',
        description: 'View own enrollments',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:read-client' },
      update: {},
      create: {
        name: 'enrollment:read-client',
        resource: 'enrollment',
        action: 'read-client',
        description: 'View client enrollments',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:read-detail' },
      update: {},
      create: {
        name: 'enrollment:read-detail',
        resource: 'enrollment',
        action: 'read-detail',
        description: 'View enrollment details',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:update' },
      update: {},
      create: {
        name: 'enrollment:update',
        resource: 'enrollment',
        action: 'update',
        description: 'Update enrollment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:cancel' },
      update: {},
      create: {
        name: 'enrollment:cancel',
        resource: 'enrollment',
        action: 'cancel',
        description: 'Cancel enrollment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:resume' },
      update: {},
      create: {
        name: 'enrollment:resume',
        resource: 'enrollment',
        action: 'resume',
        description: 'Resume suspended enrollment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:link-client' },
      update: {},
      create: {
        name: 'enrollment:link-client',
        resource: 'enrollment',
        action: 'link-client',
        description: 'Link client to enrollment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:generate-payment-link' },
      update: {},
      create: {
        name: 'enrollment:generate-payment-link',
        resource: 'enrollment',
        action: 'generate-payment-link',
        description: 'Generate payment link',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'enrollment:stats' },
      update: {},
      create: {
        name: 'enrollment:stats',
        resource: 'enrollment',
        action: 'stats',
        description: 'View enrollment statistics',
      },
    }),
  ]);

  // Invoice permissions
  const invoicePermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'invoice:read' },
      update: {},
      create: {
        name: 'invoice:read',
        resource: 'invoice',
        action: 'read',
        description: 'View invoices list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'invoice:read-own' },
      update: {},
      create: {
        name: 'invoice:read-own',
        resource: 'invoice',
        action: 'read-own',
        description: 'View own invoices',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'invoice:read-client' },
      update: {},
      create: {
        name: 'invoice:read-client',
        resource: 'invoice',
        action: 'read-client',
        description: 'View client invoices',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'invoice:read-detail' },
      update: {},
      create: {
        name: 'invoice:read-detail',
        resource: 'invoice',
        action: 'read-detail',
        description: 'View invoice details',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'invoice:resolve' },
      update: {},
      create: {
        name: 'invoice:resolve',
        resource: 'invoice',
        action: 'resolve',
        description: 'Manually resolve invoice payment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'invoice:undo-payment' },
      update: {},
      create: {
        name: 'invoice:undo-payment',
        resource: 'invoice',
        action: 'undo-payment',
        description: 'Undo invoice payment',
      },
    }),
  ]);

  // Commission permissions
  const commissionPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'commission:read' },
      update: {},
      create: {
        name: 'commission:read',
        resource: 'commission',
        action: 'read',
        description: 'View commissions list',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'commission:read-own' },
      update: {},
      create: {
        name: 'commission:read-own',
        resource: 'commission',
        action: 'read-own',
        description: 'View own commissions',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'commission:read-detail' },
      update: {},
      create: {
        name: 'commission:read-detail',
        resource: 'commission',
        action: 'read-detail',
        description: 'View commission details',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'commission:mark-paid' },
      update: {},
      create: {
        name: 'commission:mark-paid',
        resource: 'commission',
        action: 'mark-paid',
        description: 'Mark commission as paid',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'commission:stats' },
      update: {},
      create: {
        name: 'commission:stats',
        resource: 'commission',
        action: 'stats',
        description: 'View commission statistics',
      },
    }),
  ]);

  // Payment permissions
  const paymentPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'payment:initialize' },
      update: {},
      create: {
        name: 'payment:initialize',
        resource: 'payment',
        action: 'initialize',
        description: 'Initialize payment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'payment:verify' },
      update: {},
      create: {
        name: 'payment:verify',
        resource: 'payment',
        action: 'verify',
        description: 'Verify payment',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'payment:webhook' },
      update: {},
      create: {
        name: 'payment:webhook',
        resource: 'payment',
        action: 'webhook',
        description: 'Handle payment webhook',
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

  const agentRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'agent',
        appContext: 'crm',
      },
    },
    update: {},
    create: {
      name: 'agent',
      appContext: 'crm',
      description: 'Sales agent in CRM',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'client',
        appContext: 'client',
      },
    },
    update: {},
    create: {
      name: 'client',
      appContext: 'client',
      description: 'Client in client app',
    },
  });

  const partnerRole = await prisma.role.upsert({
    where: {
      name_appContext: {
        name: 'partner',
        appContext: 'crm',
      },
    },
    update: {},
    create: {
      name: 'partner',
      appContext: 'crm',
      description: 'Business partner in CRM',
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

  // Assign all enrollment, invoice, commission, payment permissions to admin
  await Promise.all([
    ...enrollmentPermissions.map((permission) =>
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
    ...invoicePermissions.map((permission) =>
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
    ...commissionPermissions.map((permission) =>
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
    ...paymentPermissions.map((permission) =>
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

  // Agent role permissions
  const agentPermissionNames = [
    'enrollment:create',
    'enrollment:read-own',
    'enrollment:read-detail',
    'enrollment:generate-payment-link',
    'invoice:read-own',
    'invoice:read-detail',
    'commission:read-own',
    'commission:read-detail',
    'commission:stats',
    'payment:initialize',
  ];
  const agentPerms = [
    ...enrollmentPermissions,
    ...invoicePermissions,
    ...commissionPermissions,
    ...paymentPermissions,
  ].filter((p) => agentPermissionNames.includes(p.name));

  await Promise.all(
    agentPerms.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: agentRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: agentRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Client role permissions
  const clientPermissionNames = [
    'enrollment:read-client',
    'enrollment:read-detail',
    'invoice:read-client',
    'invoice:read-detail',
    'payment:initialize',
    'payment:verify',
  ];
  const clientPerms = [
    ...enrollmentPermissions,
    ...invoicePermissions,
    ...paymentPermissions,
  ].filter((p) => clientPermissionNames.includes(p.name));

  await Promise.all(
    clientPerms.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: clientRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: clientRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Partner role permissions
  const partnerPermissionNames = [
    'commission:read-own',
    'commission:read-detail',
    'commission:stats',
  ];
  const partnerPerms = commissionPermissions.filter((p) =>
    partnerPermissionNames.includes(p.name)
  );

  await Promise.all(
    partnerPerms.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: partnerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: partnerRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

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
