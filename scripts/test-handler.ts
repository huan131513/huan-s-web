/**
 * Test NextAuth Handler Creation
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function test() {
  try {
    const NextAuth = require("next-auth").default;
    const { getAuthOptions } = require("../lib/auth");
    
    console.log("Creating NextAuth handler...");
    const authOptions = getAuthOptions();
    const handler = NextAuth(authOptions);
    
    console.log("Handler type:", typeof handler);
    console.log("Handler keys:", Object.keys(handler || {}));
    console.log("Has handlers property?", !!handler?.handlers);
    
    if (handler?.handlers) {
      console.log("Handlers keys:", Object.keys(handler.handlers));
      console.log("Is GET function?", typeof handler.handlers?.GET);
      console.log("Is POST function?", typeof handler.handlers?.POST);
    }
    
    if (handler && typeof handler === "object") {
      console.log("\nHandler structure:");
      console.log(JSON.stringify(Object.keys(handler), null, 2));
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

test();

