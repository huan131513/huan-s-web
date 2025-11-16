/**
 * Check NextAuth Configuration
 * Run with: npx tsx scripts/check-nextauth-config.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), ".env.local");
console.log("Loading environment from:", envPath);
const result = config({ path: envPath });

if (result.error) {
  console.error("❌ Error loading .env.local:", result.error);
  process.exit(1);
}

console.log("\n=== NextAuth Configuration Check ===\n");

// Check required environment variables
const requiredVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL,
};

const optionalVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};

console.log("Required Environment Variables:");
let allRequiredPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Security: Don't print sensitive values
    if (key === "DATABASE_URL" || key === "NEXTAUTH_SECRET") {
      console.log(`  ✅ ${key}: [已設置]`);
    } else {
      console.log(`  ✅ ${key}: ${value}`);
    }
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    allRequiredPresent = false;
  }
}

console.log("\nOptional OAuth Environment Variables:");
let oauthCount = 0;
for (const [key, value] of Object.entries(optionalVars)) {
  if (value && !value.includes("your-")) {
    // Security: Don't print sensitive OAuth credentials
    console.log(`  ✅ ${key}: [已設置]`);
    oauthCount++;
  } else {
    console.log(`  ⚠️  ${key}: Not configured`);
  }
}

console.log("\n=== Summary ===");
if (allRequiredPresent) {
  console.log("✅ All required environment variables are present");
} else {
  console.log("❌ Some required environment variables are missing");
  process.exit(1);
}

if (oauthCount === 0) {
  console.log("⚠️  No OAuth providers configured (only email/password login will work)");
} else if (oauthCount === 2) {
  console.log(`✅ ${oauthCount / 2} OAuth provider(s) configured`);
} else {
  console.log(`⚠️  OAuth providers partially configured (${oauthCount} of 4 variables)`);
}

console.log("\n✅ Configuration check complete!");



