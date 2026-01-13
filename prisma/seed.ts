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
    prisma.permission.upsert({
      where: { name: 'partnership:view_clients' },
      update: {},
      create: {
        name: 'partnership:view_clients',
        resource: 'partnership',
        action: 'view_clients',
        description: 'View clients onboarded by partner',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'partnership:suspend' },
      update: {},
      create: {
        name: 'partnership:suspend',
        resource: 'partnership',
        action: 'suspend',
        description: 'Suspend or unsuspend partnerships',
      },
    }),
  ]);

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full system access',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager with broad system access',
    },
  });

  const agentRole = await prisma.role.upsert({
    where: { name: 'agent' },
    update: {},
    create: {
      name: 'agent',
      description: 'Sales agent',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'client' },
    update: {},
    create: {
      name: 'client',
      description: 'Client user',
    },
  });

  const partnerRole = await prisma.role.upsert({
    where: { name: 'partner' },
    update: {},
    create: {
      name: 'partner',
      description: 'Business partner',
    },
  });

  const operationsManagerRole = await prisma.role.upsert({
    where: { name: 'operations-manager' },
    update: {},
    create: {
      name: 'operations-manager',
      description: 'Operations Manager',
    },
  });

  const hrRole = await prisma.role.upsert({
    where: { name: 'hr' },
    update: {},
    create: {
      name: 'hr',
      description: 'Human Resources',
    },
  });

  const accountingRole = await prisma.role.upsert({
    where: { name: 'accounting' },
    update: {},
    create: {
      name: 'accounting',
      description: 'Accounting staff',
    },
  });

  const accountingManagerRole = await prisma.role.upsert({
    where: { name: 'accounting-manager' },
    update: {},
    create: {
      name: 'accounting-manager',
      description: 'Accounting Manager',
    },
  });

  const salesManagerRole = await prisma.role.upsert({
    where: { name: 'sales-manager' },
    update: {},
    create: {
      name: 'sales-manager',
      description: 'Sales Manager',
    },
  });

  const mediaManagerRole = await prisma.role.upsert({
    where: { name: 'media-manager' },
    update: {},
    create: {
      name: 'media-manager',
      description: 'Media Manager',
    },
  });

  const cstRole = await prisma.role.upsert({
    where: { name: 'cst' },
    update: {},
    create: {
      name: 'cst',
      description: 'Customer Service Team',
    },
  });

  const cstManagerRole = await prisma.role.upsert({
    where: { name: 'cst-manager' },
    update: {},
    create: {
      name: 'cst-manager',
      description: 'Customer Service Team Manager',
    },
  });

  // Assign permissions to client role
  await Promise.all([
    ...customerPermissions.map((permission) =>
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
    ),
  ]);

  // Assign admin permissions to admin and manager roles
  await Promise.all([
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
    ...adminPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
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
    ...customerPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      })
    ),
  ]);

  // Assign all enrollment, invoice, commission, payment permissions to admin and manager
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
    ...enrollmentPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
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
    ...invoicePermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
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
    ...commissionPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
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
    ...paymentPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
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
    'partnership:view_own',
    'partnership:view_clients',
  ];
  const partnerPerms = [
    ...commissionPermissions,
    ...customerPermissions,
  ].filter((p) => partnerPermissionNames.includes(p.name));

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

  // Create capabilities
  const capabilities = await Promise.all([
    // Interest capabilities
    prisma.capability.upsert({
      where: { name: 'view:interest' },
      update: {},
      create: { name: 'view:interest', description: 'View interests' },
    }),
    prisma.capability.upsert({
      where: { name: 'create:interest' },
      update: {},
      create: { name: 'create:interest', description: 'Create interests' },
    }),
    prisma.capability.upsert({
      where: { name: 'update:interest' },
      update: {},
      create: { name: 'update:interest', description: 'Update interests' },
    }),
    prisma.capability.upsert({
      where: { name: 'delete:interest' },
      update: {},
      create: { name: 'delete:interest', description: 'Delete interests' },
    }),
    // Appointment capabilities
    prisma.capability.upsert({
      where: { name: 'view:appointment' },
      update: {},
      create: { name: 'view:appointment', description: 'View appointments' },
    }),
    prisma.capability.upsert({
      where: { name: 'create:appointment' },
      update: {},
      create: { name: 'create:appointment', description: 'Create appointments' },
    }),
    prisma.capability.upsert({
      where: { name: 'update:appointment' },
      update: {},
      create: { name: 'update:appointment', description: 'Update appointments' },
    }),
    prisma.capability.upsert({
      where: { name: 'delete:appointment' },
      update: {},
      create: { name: 'delete:appointment', description: 'Delete appointments' },
    }),
    // Enrollment capabilities
    prisma.capability.upsert({
      where: { name: 'view:enrollment' },
      update: {},
      create: { name: 'view:enrollment', description: 'View enrollments' },
    }),
    prisma.capability.upsert({
      where: { name: 'create:enrollment' },
      update: {},
      create: { name: 'create:enrollment', description: 'Create enrollments' },
    }),
    prisma.capability.upsert({
      where: { name: 'update:enrollment' },
      update: {},
      create: { name: 'update:enrollment', description: 'Update enrollments' },
    }),
    prisma.capability.upsert({
      where: { name: 'cancel:enrollment' },
      update: {},
      create: { name: 'cancel:enrollment', description: 'Cancel enrollments' },
    }),
    prisma.capability.upsert({
      where: { name: 'resume:enrollment' },
      update: {},
      create: { name: 'resume:enrollment', description: 'Resume enrollments' },
    }),
    // Invoice capabilities
    prisma.capability.upsert({
      where: { name: 'view:invoice' },
      update: {},
      create: { name: 'view:invoice', description: 'View invoices' },
    }),
    prisma.capability.upsert({
      where: { name: 'resolve:invoice' },
      update: {},
      create: { name: 'resolve:invoice', description: 'Resolve invoices' },
    }),
    prisma.capability.upsert({
      where: { name: 'download:invoice' },
      update: {},
      create: { name: 'download:invoice', description: 'Download invoices' },
    }),
    // Commission capabilities
    prisma.capability.upsert({
      where: { name: 'view:commission' },
      update: {},
      create: { name: 'view:commission', description: 'View commissions' },
    }),
    // Properties capabilities
    prisma.capability.upsert({
      where: { name: 'view:properties' },
      update: {},
      create: { name: 'view:properties', description: 'View properties' },
    }),
    prisma.capability.upsert({
      where: { name: 'create:properties' },
      update: {},
      create: { name: 'create:properties', description: 'Create properties' },
    }),
    // KYC capabilities
    prisma.capability.upsert({
      where: { name: 'view:kyc' },
      update: {},
      create: { name: 'view:kyc', description: 'View KYC records' },
    }),
    prisma.capability.upsert({
      where: { name: 'manage:kyc' },
      update: {},
      create: { name: 'manage:kyc', description: 'Manage own KYC' },
    }),
    prisma.capability.upsert({
      where: { name: 'review:kyc' },
      update: {},
      create: { name: 'review:kyc', description: 'Review KYC submissions' },
    }),
    // Partnership capabilities
    prisma.capability.upsert({
      where: { name: 'view:partnership' },
      update: {},
      create: { name: 'view:partnership', description: 'View partnerships' },
    }),
    prisma.capability.upsert({
      where: { name: 'create:partnership' },
      update: {},
      create: { name: 'create:partnership', description: 'Apply for partnership' },
    }),
    prisma.capability.upsert({
      where: { name: 'manage:partnership' },
      update: {},
      create: { name: 'manage:partnership', description: 'Manage partnerships' },
    }),
    // User management capabilities
    prisma.capability.upsert({
      where: { name: 'view:users' },
      update: {},
      create: { name: 'view:users', description: 'View users' },
    }),
    prisma.capability.upsert({
      where: { name: 'manage:users' },
      update: {},
      create: { name: 'manage:users', description: 'Manage users' },
    }),
    // Role management
    prisma.capability.upsert({
      where: { name: 'manage:roles' },
      update: {},
      create: { name: 'manage:roles', description: 'Manage roles and permissions' },
    }),
  ]);

  // Map permissions to capabilities
  const capabilityMap: Record<string, string[]> = {
    'view:interest': ['properties:read'],
    'create:interest': ['properties:create'],
    'update:interest': ['properties:read'],
    'delete:interest': ['properties:read'],
    'view:appointment': ['properties:read'],
    'create:appointment': ['properties:create'],
    'update:appointment': ['properties:read'],
    'delete:appointment': ['properties:read'],
    'view:enrollment': ['enrollment:read', 'enrollment:read-own', 'enrollment:read-client', 'enrollment:read-detail'],
    'create:enrollment': ['enrollment:create'],
    'update:enrollment': ['enrollment:update', 'enrollment:link-client'],
    'cancel:enrollment': ['enrollment:cancel'],
    'resume:enrollment': ['enrollment:resume'],
    'view:invoice': ['invoice:read', 'invoice:read-own', 'invoice:read-client', 'invoice:read-detail'],
    'resolve:invoice': ['invoice:resolve', 'invoice:undo-payment'],
    'download:invoice': ['invoice:read-detail'],
    'view:commission': ['commission:read', 'commission:read-own', 'commission:read-detail', 'commission:stats'],
    'view:properties': ['properties:read'],
    'create:properties': ['properties:create'],
    'view:kyc': ['kyc:view_all'],
    'manage:kyc': ['kyc:view_own', 'kyc:manage'],
    'review:kyc': ['kyc:review'],
    'view:partnership': ['partnership:view_all', 'partnership:view_own', 'partnership:view_clients'],
    'create:partnership': ['partnership:apply'],
    'manage:partnership': ['partnership:review', 'partnership:suspend'],
    'view:users': ['users:read'],
    'manage:users': ['users:write', 'users:delete'],
    'manage:roles': ['roles:manage'],
  };

  // Create permission-capability mappings
  for (const [capabilityName, permissionNames] of Object.entries(capabilityMap)) {
    const capability = capabilities.find(c => c.name === capabilityName);
    if (!capability) continue;

    for (const permissionName of permissionNames) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.permissionCapability.upsert({
          where: {
            permissionId_capabilityId: {
              permissionId: permission.id,
              capabilityId: capability.id,
            },
          },
          update: {},
          create: {
            permissionId: permission.id,
            capabilityId: capability.id,
          },
        });
      }
    }
  }

  // Create test admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      isEmailVerified: true,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+2348012345678',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create test manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: hashedPassword,
      isEmailVerified: true,
    },
  });

  await prisma.admin.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      firstName: 'Manager',
      lastName: 'User',
      phone: '+2348012345679',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: managerUser.id,
        roleId: managerRole.id,
      },
    },
    update: {},
    create: {
      userId: managerUser.id,
      roleId: managerRole.id,
    },
  });

  // Create test client user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      isEmailVerified: true,
    },
  });

  // Create Client record for regular user
  await prisma.client.upsert({
    where: { userId: regularUser.id },
    update: {},
    create: {
      userId: regularUser.id,
      firstName: 'Regular',
      lastName: 'User',
      phone: '+2348087654321',
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: clientRole.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: clientRole.id,
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
  console.log('\nTest users:');
  console.log('  Admin: admin@example.com / password123 (role: admin)');
  console.log('  Manager: manager@example.com / password123 (role: manager)');
  console.log('  Client: user@example.com / password123 (role: client)');
  console.log('\nRoles created:');
  console.log('  - admin, manager, agent, client, partner');
  console.log('  - operations-manager, hr, accounting, accounting-manager');
  console.log('  - sales-manager, media-manager, cst, cst-manager');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
