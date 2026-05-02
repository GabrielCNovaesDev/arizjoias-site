// Use este cliente APENAS em Route Handlers que precisam bypassar RLS.
// NUNCA importe em Client Components — expõe a service role key.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
