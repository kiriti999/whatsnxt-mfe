import { NextResponse } from "next/server";

// A faulty API route to test Sentry's error monitoring
export function GET() {
  return NextResponse.json({ data: "Testing Sentry Error..." });
}
