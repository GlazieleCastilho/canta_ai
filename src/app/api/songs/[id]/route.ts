import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/** Admin remove música (e o mp3 correspondente no Storage). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: song } = await db.from("songs").select("mp3_path").eq("id", id).single();
  const { error } = await db.from("songs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (song?.mp3_path) await db.storage.from("midia").remove([song.mp3_path]);
  return NextResponse.json({ ok: true });
}
