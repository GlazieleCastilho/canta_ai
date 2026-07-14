import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const QUEUE_SELECT =
  "id, singer_name, song_id, status, created_at, songs (id, title, artist, style, mp3_path, lrc_text)";

/** Lista a fila ativa (polling do /admin e /palco). */
export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("queue")
    .select(QUEUE_SELECT)
    .in("status", ["waiting", "performing"])
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** Convidado entra na fila (rota pública, sem senha). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const singer_name = String(body?.singer_name ?? "").trim();
  const song_id = body?.song_id;
  if (!singer_name || !song_id) {
    return NextResponse.json({ error: "Informe seu nome e escolha uma música." }, { status: 400 });
  }
  if (singer_name.length > 60) {
    return NextResponse.json({ error: "Nome muito longo." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin()
    .from("queue")
    .insert({ singer_name, song_id, status: "waiting" })
    .select(QUEUE_SELECT)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
