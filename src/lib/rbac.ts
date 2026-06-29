import db from "./db";
import { 
  userRoles,
  roles,
  rolePermissions,
  permissions
} from "@/db/schema";
import { eq, and, asc, desc, inArray } from 'drizzle-orm';

export async function hasRole(userId: string, rolesToCheck: string | string[]): Promise<boolean> {
  try {
    const rolesArray = Array.isArray(rolesToCheck) ? rolesToCheck : [rolesToCheck];
    
    const userRolesResult = await db.select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(userRoles.userId, userId),
        inArray(roles.name, rolesArray)
      ));

    return userRolesResult.length > 0;
  } catch (error) {
    console.error(`Error checking role for user ${userId}:`, error);
    throw new Error(`Failed to check role for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const userRolesResult = await db.select({
      roleName: roles.name
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

    return userRolesResult.map(ur => ur.roleName);
  } catch (error) {
    console.error(`Error getting roles for user ${userId}:`, error);
    throw new Error(`Failed to get roles for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error(`Error checking permission '${permission}' for user ${userId}:`, error);
    throw new Error(`Failed to check permission '${permission}' for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const results = await db.select({
      permissionName: permissions.name
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

    return results.map(r => r.permissionName);
  } catch (error) {
    console.error(`Error getting permissions for user ${userId}:`, error);
    throw new Error(`Failed to get permissions for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}