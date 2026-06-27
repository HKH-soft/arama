import { PermissionValue } from "@/types/auth";

// Define role definitions with their associated permissions
const roleDefinitions: Record<string, { permissions: PermissionValue[] }> = {
  SUPER_ADMIN: {
    permissions: [
      "users:read",
      "users:write", 
      "users:delete",
      "roles:read",
      "roles:write",
      "permissions:read",
      "permissions:write",
      "plans:read",
      "plans:write",
      "subscriptions:read",
      "subscriptions:write",
      "payments:read",
      "payments:write",
      "audit:read",
      "stats:read"
    ]
  },
  ADMIN: {
    permissions: [
      "users:read",
      "users:write", 
      "roles:read",
      "roles:write",
      "plans:read",
      "plans:write",
      "subscriptions:read",
      "payments:read",
      "stats:read"
    ]
  },
  USER: {
    permissions: [
      "profile:read",
      "profile:write",
      "subscription:read",
      "payment:read"
    ]
  }
};

export function hasPermission(role: string, permission: PermissionValue): boolean {
  const roleDefinition = roleDefinitions[role.toUpperCase()];
  if (!roleDefinition) {
    return false;
  }
  
  return roleDefinition.permissions.includes(permission);
}

export function getAllPermissions(): PermissionValue[] {
  return Object.values(roleDefinitions).flatMap(role => role.permissions);
}

export function getRolePermissions(role: string): PermissionValue[] {
  const roleDefinition = roleDefinitions[role.toUpperCase()];
  return roleDefinition ? roleDefinition.permissions : [];
}