import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Lista músicas (usado no /admin e no /entrar). */
export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("songs")
    .select("id, title, artist, style, mp3_path, lrc_text, created_at")
    .order("title");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** Admin cadastra música (os arquivos já foram enviados ao Storage antes). */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  const { title, artist, style, mp3_path, lrc_text } = body ?? {};
  if (!title || !artist || !style || !mp3_path || typeof lrc_text !== "string") {
    return NextResponse.json(
      { error: "Campos obrigatórios: title, artist, style, mp3_path, lrc_text." },
      { status: 400 }
    );
  }
  const { data, error } = await supabaseAdmin()
    .from("songs")
    .insert({ title, artist, style: String(style).toLowerCase().trim(), mp3_path, lrc_text })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
