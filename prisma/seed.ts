import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Define all roles
  const roleDefinitions = [
    { name: 'admin', description: 'Administrator with full system access' },
    { name: 'manager', description: 'Manager with broad system access' },
    { name: 'agent', description: 'Sales agent' },
    { name: 'client', description: 'Client user' },
    { name: 'partner', description: 'Business partner' },
    { name: 'operations-manager', description: 'Operations Manager' },
    { name: 'operations', description: 'Operations staff' },
    { name: 'hr', description: 'Human Resources' },
    { name: 'hr-manager', description: 'Human Resources Manager' },
    { name: 'accounting', description: 'Accounting staff' },
    { name: 'accounting-manager', description: 'Accounting Manager' },
    { name: 'sales-manager', description: 'Sales Manager' },
    { name: 'sales', description: 'Sales staff' },
    { name: 'media-manager', description: 'Media Manager' },
    { name: 'media', description: 'Media staff' },
    { name: 'cst', description: 'Customer Service Team' },
    { name: 'cst-manager', description: 'Customer Service Team Manager' },
    { name: 'facility-manager', description: 'Facility Manager' },
    { name: 'facility', description: 'Facility staff' },
  ];

  // Admin roles (all except partner and client)
  const adminRoleNames = roleDefinitions
    .filter(r => !['client', 'partner'].includes(r.name))
    .map(r => r.name);

  // Create roles
  const roles: Record<string, any> = {};
  for (const roleDef of roleDefinitions) {
    roles[roleDef.name] = await prisma.role.upsert({
      where: { name_appContext: { name: roleDef.name, appContext: 'SYSTEM' } },
      update: {},
      create: {
        name: roleDef.name,
        appContext: 'SYSTEM',
        description: roleDef.description,
      },
    });
  }

  // Define all permissions by resource
  const resourcePermissions = {
    dashboard: ['view', 'create', 'update', 'delete', 'manage'],
    leads: ['view', 'create', 'update', 'delete', 'manage'],
    properties: ['view', 'create', 'update', 'delete', 'manage'],
    clients: ['view', 'create', 'update', 'delete', 'manage'],
    'client-interests': ['view', 'create', 'update', 'delete', 'manage'],
    'partner-applications': ['view', 'create', 'update', 'delete', 'manage'],
    partners: ['view', 'create', 'update', 'delete', 'manage'],
    agents: ['view', 'create', 'update', 'delete', 'manage'],
    enrollments: ['view', 'create', 'update', 'delete', 'manage'],
    invoices: ['view', 'create', 'update', 'delete', 'manage'],
    payments: ['view', 'create', 'update', 'delete', 'manage'],
    kyc: ['view', 'create', 'update', 'delete', 'manage'],
    disbursements: ['view', 'create', 'update', 'delete', 'manage'],
    campaigns: ['view', 'create', 'update', 'delete', 'manage'],
    documentation: ['view', 'create', 'update', 'delete', 'manage'],
    support: ['view', 'create', 'update', 'delete', 'manage'],
    analytics: ['view', 'create', 'update', 'delete', 'manage'],
    team: ['view', 'create', 'update', 'delete', 'manage'],
    reports: ['view', 'create', 'update', 'delete', 'manage'],
    recommendations: ['view', 'create', 'update', 'delete', 'manage'],
    sales: ['view', 'create', 'update', 'delete', 'manage'],
    schedules: ['view', 'create', 'update', 'delete', 'manage'],
  };

  // Role assignment and ban permissions
  const specialPermissions = [
    { name: 'assign:role:manager', resource: 'roles', action: 'assign-manager' },
    { name: 'assign:role:hr-manager', resource: 'roles', action: 'assign-hr-manager' },
    { name: 'assign:role:others', resource: 'roles', action: 'assign-others' },
    { name: 'ban:manager', resource: 'users', action: 'ban-manager' },
    { name: 'ban:hr-manager', resource: 'users', action: 'ban-hr-manager' },
    { name: 'ban:others', resource: 'users', action: 'ban-others' },
  ];

  // Create all permissions
  const permissions: Record<string, any> = {};
  for (const [resource, actions] of Object.entries(resourcePermissions)) {
    for (const action of actions) {
      const permName = `${resource}:${action}`;
      permissions[permName] = await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: {
          name: permName,
          resource,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
        },
      });
    }
  }

  // Create special permissions
  for (const special of specialPermissions) {
    permissions[special.name] = await prisma.permission.upsert({
      where: { name: special.name },
      update: {},
      create: {
        name: special.name,
        resource: special.resource,
        action: special.action,
        description: special.name,
      },
    });
  }

  // Create capabilities with manage capability
  const capabilities: Record<string, any> = {};
  const capabilityList = ['view', 'create', 'update', 'delete', 'manage'];
  for (const cap of capabilityList) {
    capabilities[cap] = await prisma.capability.upsert({
      where: { name: cap },
      update: {},
      create: {
        name: cap,
        description: `${cap.charAt(0).toUpperCase() + cap.slice(1)} capability`,
      },
    });
  }

  // Link permissions to capabilities
  for (const [permName, permission] of Object.entries(permissions)) {
    const parts = permName.split(':');
    if (parts.length === 2 && ['view', 'create', 'update', 'delete', 'manage'].includes(parts[1])) {
      const capName = parts[1];
      await prisma.permissionCapability.upsert({
        where: {
          permissionId_capabilityId: {
            permissionId: permission.id,
            capabilityId: capabilities[capName].id,
          },
        },
        update: {},
        create: {
          permissionId: permission.id,
          capabilityId: capabilities[capName].id,
        },
      });
    }
  }

  // Permission assignment rules
  const permissionRules = {
    dashboard: { manage: adminRoleNames, others: adminRoleNames },
    leads: { manage: ['admin', 'manager', 'sales-manager'], others: adminRoleNames },
    properties: { manage: ['admin', 'manager', 'cst', 'cst-manager', 'accounting', 'accounting-manager'], others: adminRoleNames },
    clients: { manage: ['admin', 'manager', 'cst', 'cst-manager'], others: adminRoleNames },
    'client-interests': { manage: ['admin', 'manager', 'cst', 'cst-manager'], others: adminRoleNames },
    'partner-applications': { manage: ['admin', 'manager', 'hr', 'hr-manager'], others: adminRoleNames },
    partners: { manage: ['admin', 'manager', 'hr', 'hr-manager'], others: adminRoleNames },
    agents: { manage: ['admin', 'manager', 'hr-manager', 'sales-manager'], others: adminRoleNames },
    enrollments: { manage: ['admin', 'manager', 'accounting', 'accounting-manager', 'cst', 'cst-manager'], others: adminRoleNames },
    invoices: { manage: ['admin', 'manager', 'accounting', 'accounting-manager', 'cst', 'cst-manager'], others: adminRoleNames },
    payments: { manage: ['admin', 'manager', 'accounting', 'accounting-manager', 'cst', 'cst-manager'], others: adminRoleNames },
    kyc: { manage: ['admin', 'manager', 'cst', 'cst-manager'], others: adminRoleNames },
    disbursements: { manage: ['admin', 'manager', 'accounting', 'accounting-manager'], others: adminRoleNames },
    campaigns: { manage: ['admin', 'manager', 'media-manager', 'media'], others: adminRoleNames },
    documentation: { manage: ['admin', 'manager', 'cst-manager', 'cst'], others: adminRoleNames },
    support: { manage: ['admin', 'manager', 'cst-manager', 'cst'], others: adminRoleNames },
    analytics: { manage: ['admin', 'manager', 'accounting-manager'], others: adminRoleNames },
    team: { manage: ['admin', 'manager', 'hr-manager'], others: adminRoleNames },
    reports: { manage: ['admin', 'manager', 'accounting-manager'], others: adminRoleNames },
    recommendations: { manage: ['admin', 'manager'], others: adminRoleNames },
    sales: { manage: ['admin', 'manager', 'sales-manager'], others: adminRoleNames },
    schedules: { manage: ['admin', 'manager', 'operations', 'operations-manager', 'cst', 'cst-manager'], others: adminRoleNames },
  };

  // Assign permissions to roles
  const rolePermissions = [];
  for (const [resource, rules] of Object.entries(permissionRules)) {
    const actions = resourcePermissions[resource];
    for (const action of actions) {
      const permName = `${resource}:${action}`;
      const perm = permissions[permName];

      if (action === 'manage') {
        // Assign manage permission to specific roles
        for (const roleName of rules.manage) {
          rolePermissions.push({ roleId: roles[roleName].id, permissionId: perm.id });
        }
      } else {
        // Assign other actions to all admin roles
        for (const roleName of rules.others) {
          rolePermissions.push({ roleId: roles[roleName].id, permissionId: perm.id });
        }
      }
    }
  }

  // Assign special permissions (role assignment and ban)
  // admin can assign manager role
  rolePermissions.push({ roleId: roles.admin.id, permissionId: permissions['assign:role:manager'].id });
  // admin and manager can assign hr-manager role
  rolePermissions.push({ roleId: roles.admin.id, permissionId: permissions['assign:role:hr-manager'].id });
  rolePermissions.push({ roleId: roles.manager.id, permissionId: permissions['assign:role:hr-manager'].id });
  // hr-manager can assign other roles
  rolePermissions.push({ roleId: roles['hr-manager'].id, permissionId: permissions['assign:role:others'].id });

  // Ban permissions
  rolePermissions.push({ roleId: roles.admin.id, permissionId: permissions['ban:manager'].id });
  rolePermissions.push({ roleId: roles.manager.id, permissionId: permissions['ban:hr-manager'].id });
  rolePermissions.push({ roleId: roles['hr-manager'].id, permissionId: permissions['ban:others'].id });

  // Bulk upsert role permissions
  for (const rp of rolePermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: rp.roleId,
          permissionId: rp.permissionId,
        },
      },
      update: {},
      create: rp,
    });
  }

  // Create default admin user
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

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: roles.admin.id,
      },
    });

    console.log('Default admin user created: admin@example.com / password123');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
