import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { runIntegrationSync } from "@/lib/integrations/providers";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await runIntegrationSync(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
