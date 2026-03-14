import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createForecastsRecord, getForecastsPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getForecastsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createForecastsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
