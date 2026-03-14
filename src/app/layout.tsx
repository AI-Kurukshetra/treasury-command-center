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
        <div className="relative min-h-screen">
          <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-br from-teal-100/70 via-transparent to-sky-100/80" />
          <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  TC
                </span>
                <div>
                  <p className="text-sm font-semibold leading-none">Treasury Command Center</p>
                  <p className="text-xs text-muted-foreground">Liquidity, risk, and approvals</p>
                </div>
              </Link>
              <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                <Link href="/" className="hover:text-foreground">
                  Overview
                </Link>
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/auth/sign-in" className="hover:text-foreground">
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
