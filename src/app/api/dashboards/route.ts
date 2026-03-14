import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createDashboardRecord, getDashboardsPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    const payload = await getDashboardsPayload();
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const payload = await createDashboardRecord(body);
    return NextResponse.json(payload);
  } catch (error) {
    return handleApiRouteError(error);
  }
}
