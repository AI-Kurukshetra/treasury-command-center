import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { getSupabaseConfigError } from "@/lib/env";
import { SignInForm } from "@/features/auth/sign-in-form";

export default async function SignInPage() {
  const session = await getAppSession();
  const configError = getSupabaseConfigError();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-10 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Treasury access
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">Sign in to the workspace</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Access the live treasury workspace using Supabase authentication. Protected routes use
            cookie-based SSR sessions, middleware refresh, and organization-scoped access control.
          </p>
          <div className="mt-10 grid gap-4 rounded-2xl border border-dashed border-border bg-muted/30 p-6">
            <p className="text-sm font-medium">Implementation notes</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Supabase SSR auth is the only supported runtime mode.</li>
              <li>Protected dashboard routes require an authenticated Supabase user.</li>
              <li>Organization membership drives tenant-scoped data access.</li>
            </ul>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supabase sign in</CardTitle>
            <CardDescription>
              Use a valid tenant account. Configure environment variables before deploying to a new
              environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {configError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {configError}
              </div>
            ) : (
              <SignInForm />
            )}

            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Recommended setup: create one organization, one active membership, one profile row,
              and at least one cash snapshot so the protected workspace renders live data after
              login.
            </div>

            <Link href="/" className="text-sm font-medium text-primary">
              Return to overview
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
