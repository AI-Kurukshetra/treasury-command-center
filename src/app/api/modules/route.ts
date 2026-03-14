import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth";
import { getModuleCatalog } from "@/lib/modules/service";

export async function GET() {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const modules = await getModuleCatalog();
  return NextResponse.json({ modules });
}
