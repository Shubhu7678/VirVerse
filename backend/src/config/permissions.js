// Single source of truth for organization-role permissions.
// Super admin is a platform flag on User and is handled separately.
export const PERMISSIONS = {
  org_admin: [
    'org:read',
    'org:update',
    'members:read',
    'members:manage',
    'structure:manage',
    'classes:manage',
    'assignment:read',
    'assignment:create',
    'assignment:publish',
    'analytics:read',
    'classes:read',
    'audit:read',
    'report:export',
  ],
  teacher: [
    'org:read',
    'members:read',
    'assignment:create',
    'assignment:read',
    'assignment:publish',
    'analytics:read',
    'classes:read',
    'report:export',
  ],
  student: ['org:read', 'assignment:read', 'classes:read'],
};

export function can(role, permission) {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}
