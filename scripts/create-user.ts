import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local since tsx doesn't auto-load it
const envPath = resolve(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Make sure .env.local is loaded:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL");
  console.error("  SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const [, , username, password, displayName] = process.argv;

if (!username || !password) {
  console.error("Usage: npx tsx scripts/create-user.ts <username> <password> [displayName]");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = `${username}@vietnamtravel.app`;
  const name = displayName || username;

  // Create auth user (auto-confirmed)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: name },
  });

  if (authError) {
    console.error("Failed to create auth user:", authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  // Insert profile row
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    username,
    display_name: name,
  });

  if (profileError) {
    console.error("Failed to create profile:", profileError.message);
    // Clean up auth user
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log(`User created successfully:`);
  console.log(`  Username: ${username}`);
  console.log(`  Display name: ${name}`);
  console.log(`  Email (internal): ${email}`);
  console.log(`  User ID: ${userId}`);
}

main();
