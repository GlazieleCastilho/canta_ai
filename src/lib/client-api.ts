"use client";

import { createClient } from "@supabase/supabase-js";

/** fetch com JSON e erro legível (mensagem vinda da API quando houver). */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error ?? `Erro ${res.status}`);
  }
  return data as T;
}

/**
 * Sobe um arquivo direto do navegador para o Supabase Storage,
 * usando URL assinada gerada pelo servidor (evita o limite de body da Vercel).
 * Retorna o caminho do arquivo no bucket.
 */
export async function uploadMedia(kind: "mp3" | "mp4", file: File): Promise<string> {
  const { path, token } = await api<{ path: string; token: string }>("/api/upload-url", {
    method: "POST",
    body: JSON.stringify({ kind }),
  });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase.storage.from("midia").uploadToSignedUrl(path, token, file, {
    contentType: kind === "mp3" ? "audio/mpeg" : "video/mp4",
  });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return path;
}
