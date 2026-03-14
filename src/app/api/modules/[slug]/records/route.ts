import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/auth";
import { createModuleRecord } from "@/lib/modules/service";
import { moduleRecordSchemas, moduleSlugSchema } from "@/lib/modules/validators";

export async function POST(
  request: Request,
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

  const body = await request.json();
  const schema = moduleRecordSchemas[parsedSlug.data as keyof typeof moduleRecordSchemas];
  const parsedBody = schema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsedBody.error.issues.map((issue: { message: string }) => issue.message)
      },
      { status: 400 }
    );
  }

  try {
    const result = await createModuleRecord(parsedSlug.data, parsedBody.data);

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Request failed."
      },
      { status: 400 }
    );
  }
}
