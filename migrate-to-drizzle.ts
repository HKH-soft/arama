import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { execSync } from 'child_process';

console.log('Starting migration from Prisma to Drizzle...');

try {
  // Install Drizzle Kit if not already installed
  console.log('Ensuring Drizzle Kit is installed...');
  execSync('npm install drizzle-kit --save-dev', { stdio: 'inherit' });

  // Generate Drizzle schema
  console.log('Generating Drizzle schema...');
  execSync('npx drizzle-kit generate', { stdio: 'inherit' });

  console.log('Migration preparation completed!');
  console.log('To complete the migration:');
  console.log('1. Run: npx drizzle-kit push');
  console.log('2. Update your DATABASE_URL in .env if needed');
  console.log('3. Remove any remaining Prisma references from your code');
  console.log('4. Test your application thoroughly');
} catch (error) {
  console.error('Migration preparation failed:', error);
  process.exit(1);
}