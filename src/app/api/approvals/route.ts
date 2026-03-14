import { NextResponse } from "next/server";

import { handleApiRouteError } from "@/lib/api/errors";
import { createApprovalDecision, getApprovalsPayload } from "@/lib/domain/treasury-api";

export async function GET() {
  try {
    return NextResponse.json(await getApprovalsPayload());
  } catch (error) {
    return handleApiRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createApprovalDecision(await request.json()));
  } catch (error) {
    return handleApiRouteError(error);
  }
}
