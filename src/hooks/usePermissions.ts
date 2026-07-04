import { useCallback, useEffect, useState } from 'react';
import { Permission, hasPermission, hasAllPermissions, hasAnyPermission, canEditSelf } from '@/lib/permissions';

/**
 * Hook to check admin permissions
 * @returns Permission checking functions and admin role
 */
export function usePermissions() {
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current admin's role
  useEffect(() => {
    const fetchAdminRole = async () => {
      try {
        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const data = await response.json();
        console.log('Admin data response:', data);
        
        if (data.success) {
          // Check different possible response structures
          if (data.admin?.role) {
            setAdminRole(data.admin.role);
            setAdminId(data.admin.id);
          } else if (data.data?.role) {
            setAdminRole(data.data.role);
            setAdminId(data.data.id);
          } else {
            console.warn('Role not found in response:', data);
            throw new Error('Admin role not found in response');
          }
        } else {
          throw new Error(data.error || 'Failed to get admin data');
        }
      } catch (err) {
        console.error('Error fetching admin role:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminRole();
  }, []);

  // Check if admin has a specific permission
  const can = useCallback(
    (permission: Permission): boolean => {
      if (!adminRole) return false;
      
      // OWNER role always has all permissions
      if (adminRole === 'OWNER') return true;
      
      return hasPermission(adminRole as any, permission);
    },
    [adminRole]
  );

  // Check if admin has all of the specified permissions
  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      if (!adminRole) return false;
      
      // OWNER role always has all permissions
      if (adminRole === 'OWNER') return true;
      
      return hasAllPermissions(adminRole as any, permissions);
    },
    [adminRole]
  );

  // Check if admin has any of the specified permissions
  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      if (!adminRole) return false;
      
      // OWNER role always has all permissions
      if (adminRole === 'OWNER') return true;
      
      return hasAnyPermission(adminRole as any, permissions);
    },
    [adminRole]
  );

  // Check if admin can edit a specific admin (including themselves)
  const canEditAdmin = useCallback(
    (targetAdminId: number, targetRole: string): boolean => {
      if (!adminRole || adminId === null) return false;
      
      // If admin is editing themselves, allow it
      if (canEditSelf(adminId, targetAdminId, adminRole as any)) {
        return true;
      }
      
      // Otherwise, check role-based permissions for editing this specific role
      return can(`admin:edit:${targetRole.toLowerCase()}` as Permission);
    },
    [adminId, adminRole, can]
  );

  return {
    adminRole,
    adminId,
    loading,
    error,
    can,
    canAll,
    canAny,
    canEditAdmin,
  };
}
