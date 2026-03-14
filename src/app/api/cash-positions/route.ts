import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import {
  createCashPositionsRecord,
  getCashPositionsPayload
} from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getCashPositionsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createCashPositionsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
