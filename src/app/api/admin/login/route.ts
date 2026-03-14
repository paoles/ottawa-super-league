import { NextResponse } from "next/server";
import { verifyPassword, generateSessionValue, COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

// In-memory rate limiter: tracks failed attempts per IP
// Note: resets per serverless instance; provides protection in dev and single-instance deploys.
// For distributed production rate limiting, use Upstash Ratelimit.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSecs: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSecs: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSecs: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { allowed: true, retryAfterSecs: 0 };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfterSecs } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryAfterSecs} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSecs) },
      }
    );
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    clearAttempts(ip);
    const sessionValue = await generateSessionValue();
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
