import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createRiskRecord, getRiskPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getRiskPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createRiskRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
