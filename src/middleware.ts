import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000; // 7 days

async function hmacSign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Buffer.from(signature).toString("hex");
}

async function verifySession(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return false;

  const value = cookie.value;
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return false;

  const token = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);

  // Verify HMAC
  const expected = await hmacSign(token, secret);
  if (expected !== signature) return false;

  // Validate expiration: token is "{uuid}:{issuedAt}"
  const colonIdx = token.lastIndexOf(":");
  if (colonIdx === -1) return false;
  const issuedAt = parseInt(token.slice(colonIdx + 1), 10);
  if (isNaN(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false;

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const authenticated = await verifySession(request);

  if (!authenticated) {
    // API routes return 401
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes redirect to login
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
