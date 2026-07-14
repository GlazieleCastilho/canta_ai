import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

/**
 * Encerra a performance atual (status -> done).
 * Chamada pelo /palco ao fim da música — o palco não tem cookie de admin,
 * então a rota é pública; só permite a transição performing -> done.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin()
    .from("queue")
    .update({ status: "done" })
    .eq("id", id)
    .eq("status", "performing")
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? { ok: true });
}
