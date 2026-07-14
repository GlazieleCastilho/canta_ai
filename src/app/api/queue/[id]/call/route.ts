import { NextRequest, NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

/** Admin chama ao palco (status -> performing). Só um por vez. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  const db = supabaseAdmin();

  // Encerra qualquer performance pendurada antes de chamar a próxima.
  await db.from("queue").update({ status: "done" }).eq("status", "performing");

  const { data, error } = await db
    .from("queue")
    .update({ status: "performing" })
    .eq("id", id)
    .eq("status", "waiting")
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
