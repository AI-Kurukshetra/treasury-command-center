import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createDebtRecord, getDebtPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getDebtPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createDebtRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
