// Mensagens motivacionais do protótipo (karaoke.html) — inalteradas.

export const MSGS_HIGH = ["Uau, voz de show! 🌟", "Mandou muito bem! 🎤", "Isso aí, arrasando! 🔥", "Plateia em pé! 👏"];
export const MSGS_MID = ["Boa! Continue assim! 🎶", "Você está no tom! 🎵", "Show de bola! ✨"];
export const MSGS_LOW = ["Solta a voz! 💪", "Capricha na próxima linha! 🎙️", "Vai que é sua hora de brilhar! ⭐"];
export const MSGS_STREAK = ["Combo em sequência! 🔥🔥", "Sequência imparável! 🚀"];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

/** Escolhe (ou não) uma mensagem para a linha — mesma lógica do protótipo. */
export function pickToastMessage(lineScore: number, streak: number): string | null {
  if (streak > 0 && streak % 4 === 0) return pick(MSGS_STREAK);
  if (lineScore >= 85) return pick(MSGS_HIGH);
  if (lineScore >= 60 && Math.random() < 0.5) return pick(MSGS_MID);
  if (lineScore < 40 && Math.random() < 0.35) return pick(MSGS_LOW);
  return null;
}

/** Nota final -> selo, como no modal do protótipo. */
export function finalGrade(total: number): { grade: string; label: string } {
  if (total >= 90) return { grade: "🌟", label: "Estrela do Karaokê" };
  if (total >= 75) return { grade: "🎤", label: "Voz Afinada" };
  if (total >= 60) return { grade: "🎶", label: "Muito Bem!" };
  return { grade: "👏", label: "Valeu a participação!" };
}
