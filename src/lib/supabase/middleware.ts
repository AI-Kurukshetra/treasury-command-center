import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { appEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  type CookieToSet = {
    name: string;
    value: string;
    options?: CookieOptions;
  };

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  if (!appEnv.supabaseUrl || !appEnv.supabasePublishableKey) {
    return response;
  }

  const supabase = createServerClient<Database>(
    appEnv.supabaseUrl,
    appEnv.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  await supabase.auth.getClaims();

  return response;
}
