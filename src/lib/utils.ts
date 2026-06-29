import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Define the possible values for NODE_ENV
export type NodeEnv = 'development' | 'production' | 'test' | 'staging';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | number) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Determines the appropriate .env file to load based on the NODE_ENV environment variable
 * @returns The filename of the environment file to load
 */
export function getEnvFileName(): string {
  // Determine environment and return appropriate .env file
  const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";

  switch (nodeEnv) {
    case "production":
      return ".env.production";
    case "staging":
      return ".env.staging";
    case "test":
      return ".env.test";
    default:
      return ".env.local"; // Default for development
  }
}

/**
 * Loads the appropriate environment file(s) based on NODE_ENV
 * First loads .env (base), then environment-specific file (overrides)
 */
export function loadEnvironment(): void {
  // Load base .env file first (lowest priority)
  require('dotenv').config({ path: '.env' });

  // Load environment-specific file (higher priority, overrides .env)
  const envFileName = getEnvFileName();
  require('dotenv').config({ path: envFileName });
}
