import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Read .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => l.split("=").map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf("=") + 1).trim()))
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// List all businesses and their whatsapp_number
const { data: businesses, error } = await supabase
  .from("businesses")
  .select("id,name,whatsapp_number,owner_id");

console.log("Error:", error);
console.log("All businesses:");
businesses?.forEach(b => {
  console.log(`  id: ${b.id} | name: ${b.name} | whatsapp: ${JSON.stringify(b.whatsapp_number)} | owner: ${b.owner_id}`);
});
