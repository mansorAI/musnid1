import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a service-role Supabase client for trusted API routes and webhooks only.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
