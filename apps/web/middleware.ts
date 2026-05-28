import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved for auth gating — redirect to / when unauthenticated.
// Currently allows all requests through.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
