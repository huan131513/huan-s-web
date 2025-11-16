/**
 * NextAuth Database Migration Script
 * Run with: npx tsx scripts/migrate-nextauth.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

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

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("\nRunning NextAuth database migration...");
  try {
    // Make password_hash nullable
    await sql`
      ALTER TABLE users 
      ALTER COLUMN password_hash DROP NOT NULL;
    `;
    console.log("✅ Made password_hash nullable");

    // Add email_verified column if it doesn't exist
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE users ADD COLUMN email_verified TIMESTAMP WITH TIME ZONE;
        END IF;
      END $$;
    `;
    console.log("✅ Added email_verified column");

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        provider_account_id VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type VARCHAR(255),
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        UNIQUE(provider, provider_account_id)
      );
    `;
    console.log("✅ Created accounts table");

    // Create index on accounts.user_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
    `;
    console.log("✅ Created index on accounts.user_id");

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_token VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;
    console.log("✅ Created sessions table");

    // Create index on sessions.user_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `;
    console.log("✅ Created index on sessions.user_id");

    // Create verification_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        UNIQUE(identifier, token)
      );
    `;
    console.log("✅ Created verification_tokens table");

    console.log("\n✅ NextAuth migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();



