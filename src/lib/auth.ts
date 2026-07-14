import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "cantaai_admin";

/** Token de sessão derivado da senha — muda se a senha mudar. */
export function sessionToken(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error("Variável ADMIN_PASSWORD não configurada.");
  return createHash("sha256").update(`cantaai-admin:${pwd}`).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const got = jar.get(SESSION_COOKIE)?.value;
  if (!got) return false;
  const want = sessionToken();
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Resposta 401 padrão para rotas restritas ao admin. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Acesso restrito ao administrador." }, { status: 401 });
}
