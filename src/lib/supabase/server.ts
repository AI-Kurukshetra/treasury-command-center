import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { appEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createSupabaseServerClient() {
  if (!appEnv.supabaseUrl || !appEnv.supabasePublishableKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(appEnv.supabaseUrl, appEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookieValues: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }>
      ) {
        try {
          cookieValues.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always persist cookies during render.
        }
      }
    }
  });
}
