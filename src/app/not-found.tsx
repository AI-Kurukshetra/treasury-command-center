import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-lg text-muted-foreground">
        The treasury workspace you requested does not exist or your session no longer has
        access to it.
      </p>
      <div className="mt-8">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "default" }))}>
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
