import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createFxRecord, getFxPayload } from "@/lib/domain/treasury-api";

export async function GET(request: Request) {
  try {
    return NextResponse.json(await getFxPayload(request));
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createFxRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
