import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

export async function hmacSign(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Buffer.from(signature).toString("hex");
}

export async function verifyPassword(plaintext: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(plaintext, hash);
}

// Token format: "{uuid}:{issuedAt}.{hmac(uuid:issuedAt)}"
export async function generateSessionValue(): Promise<string> {
  const token = `${crypto.randomUUID()}:${Date.now()}`;
  const signature = await hmacSign(token);
  return `${token}.${signature}`;
}

export async function verifySessionValue(value: string): Promise<boolean> {
  const lastDot = value.lastIndexOf(".");
  if (lastDot === -1) return false;
  const token = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);

  // Verify HMAC
  const expected = await hmacSign(token);
  if (expected !== signature) return false;

  // Validate expiration: token is "{uuid}:{issuedAt}"
  const colonIdx = token.lastIndexOf(":");
  if (colonIdx === -1) return false;
  const issuedAt = parseInt(token.slice(colonIdx + 1), 10);
  if (isNaN(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false;

  return true;
}

// For use in Server Components only (not Route Handlers)
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return false;
    return verifySessionValue(session.value);
  } catch {
    return false;
  }
}
