import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Migrating...");
  try {
    await db.execute(sql`ALTER TABLE plans ADD COLUMN original_price integer`);
  } catch (e) { console.log("original_price might exist"); }
  try {
    await db.execute(sql`ALTER TABLE plans ADD COLUMN daily_equivalent_note text`);
  } catch (e) { console.log("daily_equivalent_note might exist"); }
  try {
    await db.execute(sql`ALTER TABLE plans ADD COLUMN is_active boolean DEFAULT true NOT NULL`);
  } catch (e) { console.log("is_active might exist"); }
  console.log("Done");
  process.exit(0);
}

main();
