import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createPaymentsRecord, getPaymentsPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getPaymentsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createPaymentsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
