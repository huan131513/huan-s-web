/**
 * Reset Database Schema
 * This will drop existing tables and recreate them with the new schema
 * Run with: npx tsx scripts/reset-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
config({ path: envPath });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(connectionString);

async function resetDatabase() {
  try {
    console.log("⚠️  WARNING: This will drop all existing tables!");
    console.log("Resetting database schema...\n");

    // Drop existing tables (CASCADE will also drop dependent objects)
    console.log("Dropping existing tables...");
    await sql`DROP TABLE IF EXISTS posts CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log("✅ Tables dropped\n");

    // Drop function if exists
    await sql`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`;

    // Read and execute new schema
    console.log("Creating new schema...");
    const schemaPath = join(process.cwd(), "lib/db/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Split into statements
    const statements: string[] = [];
    let currentStatement = "";
    let dollarQuoteLevel = 0;

    const lines = schema.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith("--")) {
        continue;
      }

      currentStatement += line + "\n";

      const dollarMatches = line.match(/\$\$/g);
      if (dollarMatches) {
        dollarQuoteLevel += dollarMatches.length;
      }

      if (trimmed.endsWith(";") && dollarQuoteLevel % 2 === 0) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith("--")) {
          statements.push(stmt);
        }
        currentStatement = "";
        dollarQuoteLevel = 0;
      }
    }

    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        } catch (error: any) {
          console.error(`✗ Error in statement ${i + 1}:`, error?.message);
          throw error;
        }
      }
    }

    console.log("\n✅ Database schema reset completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Database reset error:", error);
    throw error;
  }
}

resetDatabase()
  .then(() => {
    console.log("\n✅ Database reset completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Database reset failed:", error);
    process.exit(1);
  });




