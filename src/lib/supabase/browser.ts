import { createBrowserClient } from "@supabase/ssr";

import { appEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  if (!appEnv.supabaseUrl || !appEnv.supabasePublishableKey) {
    return null;
  }

  return createBrowserClient<Database>(
    appEnv.supabaseUrl,
    appEnv.supabasePublishableKey
  );
}
