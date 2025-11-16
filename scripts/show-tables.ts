/**
 * Show Database Tables Structure
 * Run with: npx tsx scripts/show-tables.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  try {
    console.log("📊 Neon Database Tables Structure\n");
    console.log("=".repeat(60));
    
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n📋 Table: ${tableName}`);
      console.log("-".repeat(60));
      
      // Get columns
      const columns = await sql`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      console.log("Columns:");
      columns.forEach((col: any) => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  • ${col.column_name.padEnd(20)} ${type.padEnd(20)} ${nullable}${defaultVal}`);
      });
      
      // Get indexes
      const indexes = await sql`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
        AND tablename = ${tableName}
      `;
      
      if (indexes.length > 0) {
        console.log("\nIndexes:");
        indexes.forEach((idx: any) => {
          console.log(`  • ${idx.indexname}`);
        });
      }
      
      // Get foreign keys
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = ${tableName}
      `;
      
      if (foreignKeys.length > 0) {
        console.log("\nForeign Keys:");
        foreignKeys.forEach((fk: any) => {
          console.log(`  • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }
    }
    
    // Count records
    console.log("\n" + "=".repeat(60));
    console.log("\n📈 Table Statistics:");
    
    // Count records for known tables
    try {
      const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`  • users: ${usersCount[0]?.count || 0} records`);
    } catch (e) {
      console.log(`  • users: N/A`);
    }
    
    try {
      const postsCount = await sql`SELECT COUNT(*) as count FROM posts`;
      console.log(`  • posts: ${postsCount[0]?.count || 0} records`);
    } catch (e) {
      console.log(`  • posts: N/A`);
    }
    
    console.log("\n✅ Database structure displayed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
