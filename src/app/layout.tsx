import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Treasury Command Center",
  description: "Enterprise treasury and cash management platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(27,76,161,0.16),transparent_30%),radial-gradient(circle_at_72%_0%,rgba(217,136,27,0.18),transparent_22%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-[5.5rem] -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="container flex h-20 items-center justify-between gap-6">
              <Link href="/" className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_18px_40px_rgba(14,28,67,0.22)]">
                  TC
                </span>
                <div>
                  <p className="font-display text-base font-semibold leading-none">
                    Treasury Command Center
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Liquidity, risk, and approvals
                  </p>
                </div>
              </Link>
              <div className="hidden items-center gap-4 md:flex">
                <nav className="glass-panel flex items-center gap-2 rounded-full border border-white/70 px-3 py-2 text-sm text-muted-foreground shadow-[0_18px_40px_rgba(17,30,64,0.08)]">
                  <Link
                    href="/"
                    className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-foreground"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="rounded-full px-3 py-2 transition-colors hover:bg-white hover:text-foreground"
                  >
                    Sign in
                  </Link>
                </nav>
                <div className="rounded-full border border-border/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/80 shadow-[0_18px_40px_rgba(17,30,64,0.08)]">
                  Live treasury workspace
                </div>
              </div>
              <nav className="flex items-center gap-3 text-sm md:hidden">
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Overview
                </Link>
                <Link href="/auth/sign-in" className="text-muted-foreground hover:text-foreground">
                  Sign in
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
