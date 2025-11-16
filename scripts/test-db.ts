/**
 * Test Database Connection
 * Run with: npx tsx scripts/test-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local FIRST
const envPath = resolve(process.cwd(), ".env.local");
console.log("Loading environment from:", envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  console.log("Please make sure .env.local exists and contains DATABASE_URL");
  process.exit(1);
}

console.log("✅ Environment variables loaded");
// Security: Don't print sensitive DATABASE_URL
console.log("DATABASE_URL: [已設置]");

// Import after loading env vars
import { testConnection } from "../lib/db/index";

async function main() {
  console.log("\nTesting database connection...");
  const success = await testConnection();
  
  if (success) {
    console.log("\n✅ Database connection successful!");
    process.exit(0);
  } else {
    console.error("\n❌ Database connection failed!");
    process.exit(1);
  }
}

main();
