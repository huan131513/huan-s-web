import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.error("Please create a .env.local file with DATABASE_URL");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("\nMigrating from accounts table to provider field in users table...");
  try {
    // Step 1: Add provider and providerAccountId columns to users table
    console.log("\nStep 1: Adding provider and provider_account_id columns...");
    
    // Check if provider column exists
    const providerExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'provider'
    `;

    if (providerExists.length === 0) {
      await sql`
        ALTER TABLE users 
        ADD COLUMN provider VARCHAR(50),
        ADD COLUMN provider_account_id VARCHAR(255)
      `;
      console.log("✅ Added provider and provider_account_id columns");
    } else {
      console.log("✅ provider and provider_account_id columns already exist");
    }

    // Step 2: Migrate data from accounts table to users table
    console.log("\nStep 2: Migrating data from accounts to users...");
    
    const accountsToMigrate = await sql`
      SELECT DISTINCT ON (user_id) 
        user_id, 
        provider, 
        provider_account_id
      FROM accounts
      ORDER BY user_id, provider
    `;

    if (accountsToMigrate.length > 0) {
      console.log(`Found ${accountsToMigrate.length} accounts to migrate`);
      
      for (const account of accountsToMigrate) {
        // Update user with provider information
        await sql`
          UPDATE users 
          SET provider = ${account.provider},
              provider_account_id = ${account.provider_account_id}
          WHERE id = ${account.user_id}
        `;
        console.log(`  ✅ Migrated ${account.provider} account for user ${account.user_id}`);
      }
    } else {
      console.log("No accounts to migrate");
    }

    // Step 3: Create unique constraint on (provider, provider_account_id)
    console.log("\nStep 3: Creating unique constraint on (provider, provider_account_id)...");
    
    try {
      await sql`
        ALTER TABLE users 
        ADD CONSTRAINT users_provider_account_unique UNIQUE (provider, provider_account_id)
      `;
      console.log("✅ Created unique constraint on (provider, provider_account_id)");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("✅ Unique constraint already exists");
      } else {
        throw error;
      }
    }

    // Step 4: Create index on (provider, provider_account_id)
    console.log("\nStep 4: Creating index on (provider, provider_account_id)...");
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_provider_account 
      ON users(provider, provider_account_id)
    `;
    console.log("✅ Created index on (provider, provider_account_id)");

    // Step 5: Drop accounts table
    console.log("\nStep 5: Dropping accounts table...");
    
    try {
      // First drop foreign key constraint if it exists
      await sql`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'accounts' AND constraint_type = 'FOREIGN KEY'
          ) THEN
            ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
          END IF;
        END $$;
      `;
      
      await sql`DROP TABLE IF EXISTS accounts CASCADE`;
      console.log("✅ Dropped accounts table");
    } catch (error: any) {
      console.error("⚠️  Error dropping accounts table:", error.message);
      console.log("You may need to drop it manually");
    }

    // Step 6: Handle users with same email but different providers
    // These should already be separate users, but verify
    console.log("\nStep 6: Verifying users with same email are separate...");
    
    const duplicateEmails = await sql`
      SELECT email, COUNT(*) as count, array_agg(id) as user_ids, array_agg(provider) as providers
      FROM users
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1
    `;

    if (duplicateEmails.length > 0) {
      console.log(`Found ${duplicateEmails.length} emails with multiple users (this is expected for different providers)`);
      for (const dup of duplicateEmails) {
        console.log(`  Email ${dup.email}: ${dup.count} users with providers: ${dup.providers}`);
      }
    } else {
      console.log("✅ No duplicate emails found");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });

