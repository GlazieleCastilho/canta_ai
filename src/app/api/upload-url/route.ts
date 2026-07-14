import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

const KINDS: Record<string, { folder: string; ext: string }> = {
  mp3: { folder: "audio", ext: "mp3" },
  mp4: { folder: "video", ext: "mp4" },
};

/**
 * Gera uma URL assinada de upload direto ao Storage.
 * O upload navegador -> Supabase evita o limite de ~4,5MB de body
 * das functions da Vercel (essencial para os vídeos).
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  const kind = KINDS[body?.kind as string];
  if (!kind) {
    return NextResponse.json({ error: "kind deve ser 'mp3' ou 'mp4'." }, { status: 400 });
  }
  const path = `${kind.folder}/${randomUUID()}.${kind.ext}`;
  const { data, error } = await supabaseAdmin()
    .storage.from("midia")
    .createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path, token: data.token });
}
