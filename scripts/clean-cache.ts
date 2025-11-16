/**
 * Clean Next.js cache and build files
 * Run with: npx tsx scripts/clean-cache.ts
 */

import { rmSync, existsSync } from "fs";
import { resolve } from "path";

const pathsToClean = [
  ".next",
  "node_modules/.cache",
];

console.log("🧹 Cleaning Next.js cache...\n");

let cleaned = 0;
for (const path of pathsToClean) {
  const fullPath = resolve(process.cwd(), path);
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${path}`);
      cleaned++;
    } catch (error) {
      console.error(`❌ Failed to remove ${path}:`, error);
    }
  } else {
    console.log(`⏭️  Skipped (not found): ${path}`);
  }
}

console.log(`\n✨ Cleaned ${cleaned} directory(ies)`);
console.log("\nNext steps:");
console.log("1. Run: npm install (if needed)");
console.log("2. Run: npm run dev");



