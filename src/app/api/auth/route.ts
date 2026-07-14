import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, SESSION_COOKIE, sessionToken } from "@/lib/auth";

/** O client pergunta se já há sessão de admin válida. */
export async function GET() {
  return NextResponse.json({ admin: await isAdmin().catch(() => false) });
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Login do admin: recebe a senha e grava o cookie de sessão. */
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD não configurada no servidor." }, { status: 500 });
  }
  if (typeof password !== "string" || !safeEqual(password, expected)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
  return res;
}

/** Logout do admin. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
