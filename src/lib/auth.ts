import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

export async function generateSessionValue(): Promise<string> {
  const token = crypto.randomUUID();
  const signature = await hmacSign(token);
  return `${token}.${signature}`;
}

export async function verifySessionValue(value: string): Promise<boolean> {
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  const expected = await hmacSign(token);
  return expected === signature;
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
