import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/domain/treasury";

export async function GET() {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getDashboardSnapshot();
  return NextResponse.json({ notifications: snapshot.alerts });
}
