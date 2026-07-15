"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Marquee } from "@/components/Marquee";
import { api } from "@/lib/client-api";
import type { QueueEntry, Song } from "@/lib/types";

type Joined = { id: string; name: string };

export default function EntrarPage() {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [name, setName] = useState("");
  const [songId, setSongId] = useState("");
  const [filter, setFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [artistFilter, setArtistFilter] = useState("");
  const [letterFilter, setLetterFilter] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<Joined | null>(null);
  const joinedRef = useRef<Joined | null>(null);
  joinedRef.current = joined;

  const loadQueue = useCallback(async () => {
    try {
      setQueue(await api<QueueEntry[]>("/api/queue"));
    } catch {
      /* fila é só informativa aqui — ignora falha de polling */
    }
  }, []);

  useEffect(() => {
    api<Song[]>("/api/songs")
      .then(setSongs)
      .catch((e) => setError(e.message));
    loadQueue();
    const t = setInterval(loadQueue, 4000);
    return () => clearInterval(t);
  }, [loadQueue]);

  // remove acentos para busca e filtro por letra inicial (ex: "É" conta como "E")
  const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

  const styles = useMemo(
    () => (songs ? [...new Set(songs.map((s) => s.style))].sort() : []),
    [songs]
  );
  const artists = useMemo(
    () => (songs ? [...new Set(songs.map((s) => s.artist))].sort((a, b) => a.localeCompare(b, "pt-BR")) : []),
    [songs]
  );
  const letters = useMemo(() => {
    if (!songs) return [];
    const set = new Set<string>();
    for (const s of songs) {
      const t = plain(s.title).charAt(0);
      const a = plain(s.artist).charAt(0);
      if (/[A-Z0-9]/.test(t)) set.add(t);
      if (/[A-Z0-9]/.test(a)) set.add(a);
    }
    return [...set].sort();
  }, [songs]);

  const filtered = useMemo(() => {
    if (!songs) return [];
    const q = plain(filter.trim());
    return songs.filter((s) => {
      if (styleFilter && s.style !== styleFilter) return false;
      if (artistFilter && s.artist !== artistFilter) return false;
      if (letterFilter && plain(s.title).charAt(0) !== letterFilter && plain(s.artist).charAt(0) !== letterFilter)
        return false;
      if (q && !plain(s.title).includes(q) && !plain(s.artist).includes(q)) return false;
      return true;
    });
  }, [songs, filter, styleFilter, artistFilter, letterFilter]);

  const selectedSong = songs?.find((s) => s.id === songId) ?? null;

  async function join() {
    setError(null);
    setSending(true);
    try {
      const entry = await api<QueueEntry>("/api/queue", {
        method: "POST",
        body: JSON.stringify({ singer_name: name.trim(), song_id: songId }),
      });
      setJoined({ id: entry.id, name: entry.singer_name });
      loadQueue();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não deu certo, tente de novo.");
    } finally {
      setSending(false);
    }
  }

  // posição do convidado na fila de espera
  const waiting = queue.filter((q) => q.status === "waiting");
  const myIndex = joined ? waiting.findIndex((q) => q.id === joined.id) : -1;
  const performingMe = joined && queue.some((q) => q.id === joined.id && q.status === "performing");
  const gone = joined && myIndex < 0 && !performingMe;

  // chamado ao palco: mostra o "É agora!" e leva sozinho para a letra
  // (modo teleprompter: só a letra sincronizada — o som fica no telão)
  const router = useRouter();
  useEffect(() => {
    if (!performingMe) return;
    const t = setTimeout(() => router.push("/palco?letra=1"), 3000);
    return () => clearTimeout(t);
  }, [performingMe, router]);

  return (
    <div className="center-page">
      <Marquee
        subtitle="Entre na fila"
        right={
          <div className="queue-pill">
            Na fila <b>{waiting.length}</b>
          </div>
        }
      />
      <main className="narrow">
        {!joined ? (
          <>
            <div className="hero">
              <h1 className="big-title">Canta Aí!</h1>
              <p>Escolha seu nome e sua música — a gente te chama no telão. 🎶</p>
            </div>
            {error && <div className="error-banner">{error}</div>}
            <div className="panel">
              <div className="field">
                <label>Seu nome</label>
                <input
                  type="text"
                  placeholder="Ex: Marina"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Buscar música</label>
                <input
                  type="text"
                  placeholder="Título ou artista..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              {songs !== null && songs.length > 0 && (
                <div className="filter-row">
                  <div className="field">
                    <label>Estilo</label>
                    <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
                      <option value="">Todos</option>
                      {styles.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Artista</label>
                    <select value={artistFilter} onChange={(e) => setArtistFilter(e.target.value)}>
                      <option value="">Todos</option>
                      {artists.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Letra inicial</label>
                    <select value={letterFilter} onChange={(e) => setLetterFilter(e.target.value)}>
                      <option value="">Todas</option>
                      {letters.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="song-list" style={{ maxHeight: 320, marginBottom: 14 }}>
                {songs === null ? (
                  <div className="empty-state">Carregando músicas...</div>
                ) : filtered.length === 0 ? (
                  <div className="empty-state">
                    <div className="big">🎶</div>
                    {songs.length === 0
                      ? "Nenhuma música cadastrada ainda — chama o anfitrião!"
                      : "Nada encontrado com essa busca."}
                  </div>
                ) : (
                  filtered.map((s) => (
                    <div
                      key={s.id}
                      className={`song-card selectable ${songId === s.id ? "selected" : ""}`}
                      onClick={() => setSongId(s.id)}
                    >
                      <div className="song-thumb">{songId === s.id ? "✅" : "🎵"}</div>
                      <div className="song-meta">
                        <div className="t">{s.title}</div>
                        <div className="a">{s.artist}</div>
                        <div className="tag-row">
                          <span className="tag style">{s.style}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedSong && (
                <p className="join-summary">
                  🎤 <b>{name.trim() || "Você"}</b> vai cantar{" "}
                  <b>
                    {selectedSong.title} — {selectedSong.artist}
                  </b>
                </p>
              )}
              <button
                className="btn btn-primary btn-block"
                disabled={!name.trim() || !songId || sending}
                onClick={join}
              >
                {sending
                  ? "Entrando..."
                  : selectedSong
                    ? `Entrar na fila com "${selectedSong.title}" 🎤`
                    : "Entrar na fila 🎤"}
              </button>
            </div>
          </>
        ) : (
          <div className="panel" style={{ textAlign: "center", marginTop: 30 }}>
            {performingMe ? (
              <>
                <div className="hero" style={{ margin: "10px 0" }}>
                  <h1 className="big-title">É agora! 🌟</h1>
                  <p>{joined.name}, você foi chamado(a) — corre pro palco!</p>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>Abrindo o palco... 🎤</p>
                </div>
              </>
            ) : gone ? (
              <>
                <div className="empty-state" style={{ border: "none" }}>
                  <div className="big">👏</div>
                  Sua vez já passou (ou você saiu da fila).
                  <br />
                  Quer cantar de novo?
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    setJoined(null);
                    setSongId("");
                  }}
                >
                  Entrar na fila outra vez
                </button>
              </>
            ) : (
              <>
                <h2 className="section-title" style={{ justifyContent: "center" }}>
                  <span className="dot" /> Você está na fila!
                </h2>
                <div className="position-badge">{myIndex + 1}º</div>
                <p style={{ color: "var(--muted)", fontSize: 13.5 }}>
                  {joined.name}, {myIndex === 0 ? "você é o próximo! Fica por perto 👀" : `faltam ${myIndex} antes de você. A tela atualiza sozinha.`}
                </p>
              </>
            )}
          </div>
        )}
      </main>
      <div className="chase-lights pink" />
    </div>
  );
}
