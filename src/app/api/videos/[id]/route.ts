import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/** Admin remove vídeo de fundo (e o mp4 correspondente no Storage). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: video } = await db.from("background_videos").select("mp4_path").eq("id", id).single();
  const { error } = await db.from("background_videos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (video?.mp4_path) await db.storage.from("midia").remove([video.mp4_path]);
  return NextResponse.json({ ok: true });
}
