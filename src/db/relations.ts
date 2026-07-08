/**
 * Relations barrel — re-exports the correct dialect based on DATABASE_DRIVER.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
import type * as RelTypes from "./relations-sqlite";

const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod: typeof RelTypes =
  driver === "neon"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./relations-pg")
    : // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./relations-sqlite");

export const usersRelations = mod.usersRelations;
export const accountsRelations = mod.accountsRelations;
export const sessionsRelations = mod.sessionsRelations;
export const blogCategoriesRelations = mod.blogCategoriesRelations;
export const blogPostsRelations = mod.blogPostsRelations;
