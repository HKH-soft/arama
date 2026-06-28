import db from "./db";
import { 
  users
} from "@/db/schema";
import { eq, and } from 'drizzle-orm';
import * as argon2 from "argon2";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  try {
    const userResult = await db.select()
      .from(users)
      .where(and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ));
      
    return userResult[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    const userResult = await db.select()
      .from(users)
      .where(and(
        eq(users.id, id),
        eq(users.isDeleted, false)
      ));
      
    return userResult[0] || null;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  try {
    // Try Argon2 first
    return await argon2.hash(password);
  } catch (error) {
    // Fallback to bcrypt
    return await bcrypt.hash(password, 12);
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Try Argon2 first
    return await argon2.verify(hash, password);
  } catch (error) {
    // Fallback to bcrypt
    return await bcrypt.compare(password, hash);
  }
}