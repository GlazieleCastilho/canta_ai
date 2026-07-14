import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Lista vídeos de fundo (com o estilo de cada um). */
export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("background_videos")
    .select("id, style, mp4_path, created_at")
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** Admin cadastra vídeo de fundo (mp4 já enviado ao Storage). */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  const { style, mp4_path } = body ?? {};
  if (!style || !mp4_path) {
    return NextResponse.json({ error: "Campos obrigatórios: style, mp4_path." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin()
    .from("background_videos")
    .insert({ style: String(style).toLowerCase().trim(), mp4_path })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
