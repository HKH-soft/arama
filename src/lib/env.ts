export type NodeEnv = 'development' | 'production' | 'test' | 'staging';

/**
 * Determines the appropriate .env file to load based on the NODE_ENV environment variable
 * @returns The filename of the environment file to load
 */
export function getEnvFileName(): string {
  const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";

  switch (nodeEnv) {
    case "production":
      return ".env.production";
    case "staging":
      return ".env.staging";
    case "test":
      return ".env.test";
    default:
      return ".env.local";
  }
}

/**
 * Loads the appropriate environment file(s) based on NODE_ENV
 * First loads .env (base), then environment-specific file (overrides)
 * Note: This uses require('dotenv') — server-side only, do not import in client components.
 */
export function loadEnvironment(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: '.env' });

  const envFileName = getEnvFileName();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: envFileName });
}
