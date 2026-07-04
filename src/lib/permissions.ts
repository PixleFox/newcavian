import { Admin } from '@prisma/client';

// Admin role types for type safety
export type AdminRoleType = 'OWNER' | 'MANAGER' | 'SELLER' | 'MARKETER' | 'OPERATOR';

// Permission types
export type Permission = 
  // Admin management permissions
  | 'admin:create'
  | 'admin:view'
  | 'admin:edit'
  | 'admin:delete'
  | 'admin:view:owner'
  | 'admin:view:manager'
  | 'admin:view:seller'
  | 'admin:view:marketer'
  | 'admin:view:operator'
  | 'admin:edit:owner'
  | 'admin:edit:manager'
  | 'admin:edit:seller'
  | 'admin:edit:marketer'
  | 'admin:edit:operator'
  | 'admin:create:owner'
  | 'admin:create:manager'
  | 'admin:create:seller'
  | 'admin:create:marketer'
  | 'admin:create:operator'
  
  // Other permissions (unchanged)
  | 'user:create'
  | 'user:view'
  | 'user:edit'
  | 'user:delete'
  | 'product:create'
  | 'product:view'
  | 'product:edit'
  | 'product:delete'
  | 'order:create'
  | 'order:view'
  | 'order:edit'
  | 'order:delete'
  | 'order:process'
  | 'discount:create'
  | 'discount:view'
  | 'discount:edit'
  | 'discount:delete'
  | 'ticket:create'
  | 'ticket:view'
  | 'ticket:respond'
  | 'ticket:close'
  | 'report:sales'
  | 'report:users'
  | 'report:inventory'
  | 'report:marketing';

// Define role-based permissions
export const rolePermissions: Record<AdminRoleType, Permission[]> = {
  // 1. OWNER has ultimate permissions
  OWNER: [
    // All admin management permissions
    'admin:create', 'admin:view', 'admin:edit', 'admin:delete',
    'admin:view:owner', 'admin:view:manager', 'admin:view:seller', 'admin:view:marketer', 'admin:view:operator',
    'admin:edit:owner', 'admin:edit:manager', 'admin:edit:seller', 'admin:edit:marketer', 'admin:edit:operator',
    'admin:create:owner', 'admin:create:manager', 'admin:create:seller', 'admin:create:marketer', 'admin:create:operator',
    
    // All other permissions
    'user:create', 'user:view', 'user:edit', 'user:delete',
    'product:create', 'product:view', 'product:edit', 'product:delete',
    'order:create', 'order:view', 'order:edit', 'order:delete', 'order:process',
    'discount:create', 'discount:view', 'discount:edit', 'discount:delete',
    'ticket:create', 'ticket:view', 'ticket:respond', 'ticket:close',
    'report:sales', 'report:users', 'report:inventory', 'report:marketing'
  ],
  
  // 2. MANAGER can view all, but only edit and create some roles
  MANAGER: [
    // View all admin types
    'admin:view', 
    'admin:view:owner', 'admin:view:manager', 'admin:view:seller', 'admin:view:marketer', 'admin:view:operator',
    
    // Edit and create specific admin types
    'admin:edit', 'admin:create',
    'admin:edit:seller', 'admin:edit:marketer', 'admin:edit:operator',
    'admin:create:seller', 'admin:create:marketer', 'admin:create:operator',
    
    // Other permissions
    'user:create', 'user:view', 'user:edit', 'user:delete',
    'product:create', 'product:view', 'product:edit', 'product:delete',
    'order:create', 'order:view', 'order:edit', 'order:delete', 'order:process',
    'discount:create', 'discount:view', 'discount:edit', 'discount:delete',
    'ticket:create', 'ticket:view', 'ticket:respond', 'ticket:close',
    'report:sales', 'report:users', 'report:inventory', 'report:marketing'
  ],
  
  // 3. SELLER can view SELLER/MARKETER/OPERATOR, but only edit/create MARKETER
  SELLER: [
    // View permissions for specific admin types
    'admin:view:seller', 'admin:view:marketer', 'admin:view:operator',
    
    // Edit and create permissions for MARKETER only
    'admin:edit:marketer',
    'admin:create:marketer',
    
    // Other permissions
    'user:view',
    'product:view', 'product:create', 'product:edit',
    'order:view', 'order:create', 'order:process',
    'discount:view', 'discount:create',
    'ticket:view', 'ticket:respond',
    'report:sales', 'report:inventory'
  ],
  
  // 4. MARKETER can view MARKETER/OPERATOR
  MARKETER: [
    // View permissions for specific admin types
    'admin:view:marketer', 'admin:view:operator',
    
    // Other permissions
    'user:view',
    'product:view',
    'discount:create', 'discount:view', 'discount:edit', 'discount:delete',
    'report:users', 'report:marketing'
  ],
  
  // 5. OPERATOR can view SELLER/MARKETER/OPERATOR
  OPERATOR: [
    // View permissions for specific admin types
    'admin:view:seller', 'admin:view:marketer', 'admin:view:operator',
    
    // Other permissions
    'user:view',
    'product:view',
    'order:view',
    'ticket:view', 'ticket:respond', 'ticket:close'
  ]
};

/**
 * Check if an admin has a specific permission
 * @param adminRole The role of the admin
 * @param permission The permission to check
 * @returns Boolean indicating if the admin has the permission
 */
export function hasPermission(adminRole: AdminRoleType, permission: Permission): boolean {
  // OWNER role always has all permissions
  if (adminRole === 'OWNER') return true;
  
  // For other roles, check the permission map
  return rolePermissions[adminRole]?.includes(permission) || false;
}

/**
 * Check if an admin can view admins of a specific role
 * @param viewerRole The role of the admin doing the viewing
 * @param targetRole The role of the admin being viewed
 * @returns Boolean indicating if the admin can view admins of the target role
 */
export function canViewAdminRole(viewerRole: AdminRoleType, targetRole: AdminRoleType): boolean {
  // OWNER and MANAGER can view all admin roles
  if (viewerRole === 'OWNER' || viewerRole === 'MANAGER') return true;
  
  // SELLER can view SELLER, MARKETER, and OPERATOR
  if (viewerRole === 'SELLER') {
    return ['SELLER', 'MARKETER', 'OPERATOR'].includes(targetRole);
  }
  
  // MARKETER can view MARKETER and OPERATOR
  if (viewerRole === 'MARKETER') {
    return ['MARKETER', 'OPERATOR'].includes(targetRole);
  }
  
  // OPERATOR can view SELLER, MARKETER, and OPERATOR
  if (viewerRole === 'OPERATOR') {
    return ['SELLER', 'MARKETER', 'OPERATOR'].includes(targetRole);
  }
  
  return false;
}

/**
 * Check if an admin can edit admins of a specific role
 * @param editorRole The role of the admin doing the editing
 * @param targetRole The role of the admin being edited
 * @returns Boolean indicating if the admin can edit admins of the target role
 */
export function canEditAdminRole(editorRole: AdminRoleType, targetRole: AdminRoleType): boolean {
  // OWNER can edit all admin roles
  if (editorRole === 'OWNER') return true;
  
  // MANAGER can edit SELLER, MARKETER, and OPERATOR
  if (editorRole === 'MANAGER') {
    return ['SELLER', 'MARKETER', 'OPERATOR'].includes(targetRole);
  }
  
  // SELLER can only edit MARKETER
  if (editorRole === 'SELLER') {
    return targetRole === 'MARKETER';
  }
  
  // MARKETER and OPERATOR cannot edit any admin roles
  return false;
}

/**
 * Check if an admin can edit their own data
 * @param adminId The ID of the admin trying to edit
 * @param targetAdminId The ID of the admin being edited
 * @param adminRole The role of the admin trying to edit
 * @returns Boolean indicating if the admin can edit this specific admin
 */
export function canEditSelf(adminId: number, targetAdminId: number, adminRole: AdminRoleType): boolean {
  // Only allow editing own data if it's the same admin
  // This is a separate check from the role-based permissions
  return adminId === targetAdminId;
}

/**
 * Check if an admin can create admins of a specific role
 * @param creatorRole The role of the admin doing the creating
 * @param targetRole The role of the admin being created
 * @returns Boolean indicating if the admin can create admins of the target role
 */
export function canCreateAdminRole(creatorRole: AdminRoleType, targetRole: AdminRoleType): boolean {
  // OWNER can create all admin roles
  if (creatorRole === 'OWNER') return true;
  
  // MANAGER can create SELLER, MARKETER, and OPERATOR
  if (creatorRole === 'MANAGER') {
    return ['SELLER', 'MARKETER', 'OPERATOR'].includes(targetRole);
  }
  
  // SELLER can only create MARKETER
  if (creatorRole === 'SELLER') {
    return targetRole === 'MARKETER';
  }
  
  // MARKETER and OPERATOR cannot create any admin roles
  return false;
}

/**
 * Check if an admin has all of the specified permissions
 * @param adminRole The role of the admin
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the admin has all the permissions
 */
export function hasAllPermissions(adminRole: AdminRoleType, permissions: Permission[]): boolean {
  // OWNER role always has all permissions
  if (adminRole === 'OWNER') return true;
  
  return permissions.every(permission => hasPermission(adminRole, permission));
}

/**
 * Check if an admin has any of the specified permissions
 * @param adminRole The role of the admin
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the admin has any of the permissions
 */
export function hasAnyPermission(adminRole: AdminRoleType, permissions: Permission[]): boolean {
  // OWNER role always has all permissions
  if (adminRole === 'OWNER') return true;
  
  return permissions.some(permission => hasPermission(adminRole, permission));
}
