// Define permission types
export type PermissionValue =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "roles:read"
  | "roles:write"
  | "permissions:read"
  | "permissions:write"
  | "plans:read"
  | "plans:write"
  | "subscriptions:read"
  | "subscriptions:write"
  | "payments:read"
  | "payments:write"
  | "audit:read"
  | "stats:read"
  | "profile:read"
  | "profile:write"
  | "subscription:read"
  | "payment:read";

// Define role types
export type RoleValue = "SUPER_ADMIN" | "ADMIN" | "USER";

// Define user type
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions?: string[];
  isActive: boolean;
  image?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
}
