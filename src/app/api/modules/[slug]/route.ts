import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth";
import { getModuleDetail } from "@/lib/modules/service";
import { moduleSlugSchema } from "@/lib/modules/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const parsedSlug = moduleSlugSchema.safeParse(resolvedParams.slug);
  if (!parsedSlug.success) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }

  const moduleDetail = await getModuleDetail(parsedSlug.data);
  if (!moduleDetail) {
    return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  }

  return NextResponse.json({ module: moduleDetail });
}
