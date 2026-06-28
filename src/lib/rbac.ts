import db from "./db";
import { 
  userRoles,
  roles,
  rolePermissions,
  permissions
} from "@/db/schema";
import { eq, and, asc, desc, inArray } from 'drizzle-orm';

export async function hasRole(userId: string, rolesToCheck: string | string[]): Promise<boolean> {
  const rolesArray = Array.isArray(rolesToCheck) ? rolesToCheck : [rolesToCheck];
  
  const userRolesResult = await db.select()
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(
      eq(userRoles.userId, userId),
      inArray(roles.name, rolesArray)
    ));

  return userRolesResult.length > 0;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const userRolesResult = await db.select({
    roleName: roles.name
  })
  .from(userRoles)
  .innerJoin(roles, eq(userRoles.roleId, roles.id))
  .where(eq(userRoles.userId, userId));

  return userRolesResult.map(ur => ur.roleName);
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  // Check if user has super admin role (has all permissions)
  const isSuperAdmin = await hasRole(userId, "SUPER_ADMIN");
  if (isSuperAdmin) {
    return true;
  }

  // Check if user has the specific permission through their roles
  const result = await db.select()
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(permissions.name, permission)
    ));

  return result.length > 0;
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const results = await db.select({
    permissionName: permissions.name
  })
  .from(userRoles)
  .innerJoin(roles, eq(userRoles.roleId, roles.id))
  .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
  .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
  .where(eq(userRoles.userId, userId));

  return results.map(r => r.permissionName);
}