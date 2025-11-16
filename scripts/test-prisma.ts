/**
 * Test Prisma Client
 * Run with: npx tsx scripts/test-prisma.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { prisma } from "../lib/prisma";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  try {
    console.log("Testing Prisma Client...\n");
    
    // Test connection
    await prisma.$connect();
    console.log("✅ Prisma Client connected successfully");
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Count posts
    const postCount = await prisma.post.count();
    console.log(`📊 Total posts in database: ${postCount}`);
    
    // Test query
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`\n📋 Tables in database:`);
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log("\n✅ Prisma Client test completed successfully!");
  } catch (error) {
    console.error("❌ Prisma Client test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();




