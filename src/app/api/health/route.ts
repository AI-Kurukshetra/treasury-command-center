import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "treasury-command-center",
    timestamp: new Date().toISOString()
  });
}
