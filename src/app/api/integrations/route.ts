import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import {
  createIntegrationsRecord,
  getIntegrationsPayload
} from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getIntegrationsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createIntegrationsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
