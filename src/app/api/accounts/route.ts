import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createAccountsRecord, getAccountsPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getAccountsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createAccountsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
