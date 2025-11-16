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
  console.log("\nAdding user_id column to users table...");
  try {
    // Check if user_id column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'user_id'
    `;

    if (columnExists.length > 0) {
      console.log("✅ user_id column already exists");
    } else {
      // Add user_id column
      await sql`
        ALTER TABLE users 
        ADD COLUMN user_id VARCHAR(10) UNIQUE
      `;
      console.log("✅ Added user_id column");

      // Create index on user_id
      await sql`
        CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)
      `;
      console.log("✅ Created index on user_id");

      // Generate userId for existing users
      const existingUsers = await sql`
        SELECT id, email, username FROM users WHERE user_id IS NULL
      `;

      if (existingUsers.length > 0) {
        console.log(`\nGenerating userId for ${existingUsers.length} existing users...`);
        
        for (const user of existingUsers) {
          // Generate a random 10-digit numeric userId
          let uniqueUserId = "";
          let attempts = 0;
          
          while (attempts < 100) {
            const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000;
            uniqueUserId = randomNum.toString();
            
            // Check if userId is unique
            const existing = await sql`
              SELECT id FROM users WHERE user_id = ${uniqueUserId}
            `;
            
            if (existing.length === 0) break;
            attempts++;
          }

          if (attempts >= 100) {
            // Fallback: use timestamp-based userId
            uniqueUserId = Date.now().toString().slice(-10);
            let counter = 0;
            while (counter < 100) {
              const existing = await sql`
                SELECT id FROM users WHERE user_id = ${uniqueUserId}
              `;
              if (existing.length === 0) break;
              uniqueUserId = (Date.now() + counter).toString().slice(-10);
              counter++;
            }
          }

          // Update user with generated userId
          await sql`
            UPDATE users 
            SET user_id = ${uniqueUserId}
            WHERE id = ${user.id}
          `;
          
          console.log(`  ✅ Generated userId ${uniqueUserId} for user ${user.email}`);
        }
      }

      // Make user_id NOT NULL after generating values for existing users
      await sql`
        ALTER TABLE users 
        ALTER COLUMN user_id SET NOT NULL
      `;
      console.log("✅ Made user_id NOT NULL");
    }

    // Remove unique constraint from email if it exists (to allow same email with different providers)
    try {
      await sql`
        ALTER TABLE users 
        DROP CONSTRAINT IF EXISTS users_email_key
      `;
      console.log("✅ Removed unique constraint from email");
    } catch (error: any) {
      // Constraint might not exist, that's okay
      console.log("ℹ️  Email unique constraint not found (may already be removed)");
    }

    // Add composite unique constraint on email and username
    try {
      await sql`
        ALTER TABLE users 
        ADD CONSTRAINT users_email_username_unique UNIQUE (email, username)
      `;
      console.log("✅ Added composite unique constraint on (email, username)");
    } catch (error: any) {
      // Constraint might already exist
      console.log("ℹ️  Composite unique constraint may already exist");
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

