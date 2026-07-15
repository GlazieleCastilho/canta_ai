import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Chama automaticamente o próximo da fila (o mais antigo em espera).
 * Disparada pelo /palco após o fim de uma apresentação — como o /done,
 * é pública porque o telão não tem cookie de admin; só permite a
 * transição waiting -> performing e apenas quando não há ninguém no palco.
 */
export async function POST() {
  const db = supabaseAdmin();

  const { data: performing, error: e1 } = await db
    .from("queue")
    .select("id")
    .eq("status", "performing")
    .limit(1);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (performing?.length) {
    // alguém já está no palco (ex: o admin chamou manualmente) — não mexe
    return NextResponse.json({ skipped: true });
  }

  const { data: next, error: e2 } = await db
    .from("queue")
    .select("id")
    .eq("status", "waiting")
    .order("created_at")
    .limit(1);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  if (!next?.length) return NextResponse.json({ empty: true });

  // o filtro por status waiting torna a promoção segura contra corrida:
  // se dois telões dispararem juntos, só um consegue atualizar
  const { data, error } = await db
    .from("queue")
    .update({ status: "performing" })
    .eq("id", next[0].id)
    .eq("status", "waiting")
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? { skipped: true });
}
