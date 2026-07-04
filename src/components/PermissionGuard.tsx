'use client';
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/lib/permissions';

interface PermissionGuardProps {
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render children based on admin permissions
 * @param permissions - Single permission or array of permissions required
 * @param requireAll - If true, admin must have all permissions. If false, any permission is sufficient
 * @param fallback - Optional component to render if permission check fails
 * @param children - Content to render if permission check passes
 */
export function PermissionGuard({
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { loading, adminRole, can, canAll, canAny } = usePermissions();

  // Debug output (remove in production)
  console.log('PermissionGuard:', { 
    permissions, 
    adminRole, 
    loading, 
    requireAll 
  });

  // While loading, render children to avoid flickering
  // This is a UX decision - we assume permission will be granted
  // Server-side checks will still prevent unauthorized actions
  if (loading) {
    return <>{children}</>;
  }
  
  // OWNER role always has all permissions
  if (adminRole === 'OWNER') {
    return <>{children}</>;
  }

  // Check permissions
  const hasPermission = Array.isArray(permissions)
    ? requireAll
      ? canAll(permissions)
      : canAny(permissions)
    : can(permissions);

  // Render children if has permission, otherwise render fallback
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component to protect a component with permission checks
 * @param Component - Component to wrap
 * @param permissions - Permissions required to access the component
 * @param requireAll - If true, admin must have all permissions. If false, any permission is sufficient
 * @param fallback - Optional component to render if permission check fails
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission | Permission[],
  requireAll = false,
  fallback: React.ReactNode = null
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGuard
        permissions={permissions}
        requireAll={requireAll}
        fallback={fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

export default PermissionGuard;
