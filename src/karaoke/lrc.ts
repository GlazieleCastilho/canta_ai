// Parser de LRC portado do protótipo (karaoke.html) — lógica inalterada.

export type LrcLine = { time: number; text: string };

export function parseLRC(text: string): LrcLine[] {
  const lines = text.split(/\r?\n/);
  const out: LrcLine[] = [];
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  for (const raw of lines) {
    const matches = [...raw.matchAll(re)];
    if (!matches.length) continue;
    const content = raw.replace(re, "").trim();
    for (const m of matches) {
      const min = parseInt(m[1], 10),
        sec = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, "0"), 10) : 0;
      const time = min * 60 + sec + ms / 1000;
      if (content) out.push({ time, text: content });
    }
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}
