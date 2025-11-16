/**
 * Verify Database Tables
 * Run with: npx tsx scripts/verify-tables.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
config({ path: envPath });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  try {
    console.log("Verifying database tables...\n");
    
    // Check if users table exists
    const usersTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    
    if (usersTable.length > 0) {
      console.log("✅ users table exists");
      
      // Get column info
      const usersColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `;
      console.log(`   Columns: ${usersColumns.map((c: any) => c.column_name).join(", ")}`);
    } else {
      console.log("❌ users table does not exist");
    }
    
    // Check if posts table exists
    const postsTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'posts'
    `;
    
    if (postsTable.length > 0) {
      console.log("✅ posts table exists");
      
      // Get column info
      const postsColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'posts'
        ORDER BY ordinal_position
      `;
      console.log(`   Columns: ${postsColumns.map((c: any) => c.column_name).join(", ")}`);
    } else {
      console.log("❌ posts table does not exist");
    }
    
    // Check indexes
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (tablename = 'users' OR tablename = 'posts')
    `;
    
    console.log(`\n✅ Found ${indexes.length} indexes`);
    indexes.forEach((idx: any) => {
      console.log(`   - ${idx.indexname}`);
    });
    
    console.log("\n✅ Database verification completed!");
  } catch (error) {
    console.error("❌ Verification error:", error);
    process.exit(1);
  }
}

main();




