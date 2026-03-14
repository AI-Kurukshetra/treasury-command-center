import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createQueryRecord, getQueryPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    const payload = await getQueryPayload();
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const payload = await createQueryRecord(body);
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
