import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import {
  createInvestmentsRecord,
  getInvestmentsPayload
} from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getInvestmentsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createInvestmentsRecord(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
