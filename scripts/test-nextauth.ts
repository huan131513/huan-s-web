/**
 * Test NextAuth Configuration
 * Run with: npx tsx scripts/test-nextauth.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
const envPath = resolve(process.cwd(), ".env.local");
config({ path: envPath });

console.log("=== Testing NextAuth Configuration ===\n");

async function testNextAuth() {
  try {
    // Test 1: Check environment variables
    console.log("1. Checking environment variables...");
    const requiredVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
    };

    for (const [key, value] of Object.entries(requiredVars)) {
      if (value) {
        // Security: Don't print sensitive values
        if (key === "DATABASE_URL" || key === "NEXTAUTH_SECRET") {
          console.log(`   ✅ ${key}: [已設置]`);
        } else {
          console.log(`   ✅ ${key}: ${value}`);
        }
      } else {
        console.log(`   ❌ ${key}: MISSING`);
      }
    }

    // Test 2: Try to load Prisma
    console.log("\n2. Testing Prisma connection...");
    try {
      const { prisma } = require("../lib/prisma");
      await prisma.$connect();
      console.log("   ✅ Prisma connected successfully");
      
      // Test query
      const userCount = await prisma.user.count();
      console.log(`   ✅ Database query successful (${userCount} users)`);
      
      await prisma.$disconnect();
    } catch (error: any) {
      console.log(`   ❌ Prisma error: ${error.message}`);
    }

    // Test 3: Try to load auth options
    console.log("\n3. Testing NextAuth configuration...");
    try {
      const { getAuthOptions } = require("../lib/auth");
      const authOptions = getAuthOptions();
      console.log("   ✅ Auth options created successfully");
      console.log(`   ✅ Providers: ${authOptions.providers.length}`);
      console.log(`   ✅ Session strategy: ${authOptions.session?.strategy}`);
    } catch (error: any) {
      console.log(`   ❌ Auth options error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }

    // Test 4: Try to create NextAuth handler
    console.log("\n4. Testing NextAuth handler creation...");
    try {
      const NextAuth = require("next-auth").default;
      const { getAuthOptions } = require("../lib/auth");
      const authOptions = getAuthOptions();
      const handler = NextAuth(authOptions);
      console.log("   ✅ NextAuth handler created successfully");
      console.log(`   ✅ Handler type: ${typeof handler}`);
    } catch (error: any) {
      console.log(`   ❌ Handler creation error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }

    console.log("\n=== Test Complete ===");
  } catch (error: any) {
    console.error("\n❌ Test failed:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

testNextAuth();



