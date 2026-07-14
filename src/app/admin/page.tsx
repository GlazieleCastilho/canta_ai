"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/Marquee";
import { api, uploadMedia } from "@/lib/client-api";
import { parseLRC } from "@/karaoke/lrc";
import type { BackgroundVideo, QueueEntry, Song } from "@/lib/types";
import { SUGGESTED_STYLES } from "@/lib/types";

export default function AdminPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ admin: boolean }>("/api/auth")
      .then((r) => setAdmin(r.admin))
      .catch(() => setAdmin(false));
  }, []);

  return (
    <div className="center-page">
      <Marquee subtitle="Painel do anfitrião" />
      <main className={admin ? "" : "narrow"}>
        {admin === null ? (
          <div className="empty-state">Carregando...</div>
        ) : admin ? (
          <Panel />
        ) : (
          <Login onOk={() => setAdmin(true)} />
        )}
      </main>
      <div className="chase-lights cyan" />
    </div>
  );
}

/* ---------------- login ---------------- */

function Login({ onOk }: { onOk: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth", { method: "POST", body: JSON.stringify({ password }) });
      onOk();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ marginTop: 40 }}>
      <h2 className="section-title">
        <span className="dot" /> Acesso do anfitrião
      </h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="field">
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && password && login()}
          placeholder="Senha do administrador"
        />
      </div>
      <button className="btn btn-primary btn-block" disabled={!password || busy} onClick={login}>
        {busy ? "Entrando..." : "Entrar"}
      </button>
    </div>
  );
}

/* ---------------- painel ---------------- */

function Panel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<BackgroundVideo[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [entrarUrl, setEntrarUrl] = useState("");
  // música com a letra em edição (modal) e o texto do rascunho
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [lrcDraft, setLrcDraft] = useState("");
  const [savingLrc, setSavingLrc] = useState(false);

  useEffect(() => {
    setEntrarUrl(`${window.location.origin}/entrar`);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [s, v, q] = await Promise.all([
        api<Song[]>("/api/songs"),
        api<BackgroundVideo[]>("/api/videos"),
        api<QueueEntry[]>("/api/queue"),
      ]);
      setSongs(s);
      setVideos(v);
      setQueue(q);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados.");
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(async () => {
      try {
        setQueue(await api<QueueEntry[]>("/api/queue"));
      } catch {
        /* tenta de novo no próximo tick */
      }
    }, 4000);
    return () => clearInterval(t);
  }, [refresh]);

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operação falhou.");
    }
  }

  const styles = [...new Set([...SUGGESTED_STYLES, ...songs.map((s) => s.style), ...videos.map((v) => v.style)])];

  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <div className="grid-2">
        <div>
          <AddSongPanel styles={styles} onAdded={refresh} onError={setError} />
          <AddVideoPanel styles={styles} onAdded={refresh} onError={setError} />
          <div className="panel">
            <h2 className="section-title">
              <span className="dot" /> QR code dos convidados
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 0 }}>
              Mostre este código (ou imprima) para os convidados entrarem na fila pelo celular.
            </p>
            {entrarUrl && (
              <div className="qr-box">
                <QRCodeCanvas value={entrarUrl} size={180} />
                <small>{entrarUrl}</small>
              </div>
            )}
            <p style={{ color: "var(--muted)", fontSize: 12.5, textAlign: "center" }}>
              Tela do evento: abra{" "}
              <a href="/palco" target="_blank" rel="noopener" style={{ color: "var(--cyan)", fontWeight: 700 }}>
                /palco
              </a>{" "}
              na TV ou no computador do telão.
            </p>
          </div>
        </div>

        <div>
          <div className="panel">
            <h2 className="section-title">
              <span className="dot" /> Fila de espera
            </h2>
            {queue.length === 0 ? (
              <div className="empty-state">
                <div className="big">🙋</div>A fila está vazia.
              </div>
            ) : (
              <div className="queue-list">
                {queue.map((q, i) => (
                  <div key={q.id} className={`queue-item ${q.status === "performing" ? "performing" : ""}`}>
                    <div className={`queue-pos ${q.status === "performing" ? "live" : ""}`}>
                      {q.status === "performing" ? "🎤" : i + (queue.some((x) => x.status === "performing") ? 0 : 1)}
                    </div>
                    <div className="queue-info">
                      <div className="n">{q.singer_name}</div>
                      <div className="s">
                        {q.songs ? `${q.songs.title} — ${q.songs.artist}` : "música removida"}
                        {q.status === "performing" && " · no palco agora"}
                      </div>
                    </div>
                    <div className="queue-actions">
                      {q.status === "waiting" && (
                        <button
                          className="btn btn-cyan"
                          onClick={() => act(() => api(`/api/queue/${q.id}/call`, { method: "POST" }))}
                        >
                          Chamar ao palco
                        </button>
                      )}
                      {q.status === "performing" && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => act(() => api(`/api/queue/${q.id}/done`, { method: "POST" }))}
                        >
                          Encerrar
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={() => act(() => api(`/api/queue/${q.id}`, { method: "DELETE" }))}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h2 className="section-title">
              <span className="dot" /> Biblioteca de músicas
            </h2>
            {songs.length === 0 ? (
              <div className="empty-state">
                <div className="big">🎶</div>
                Nenhuma música cadastrada ainda.
                <br />
                Adicione a primeira ao lado.
              </div>
            ) : (
              <div className="song-list">
                {songs.map((s) => (
                  <div key={s.id} className="song-card">
                    <div className="song-thumb">🎬</div>
                    <div className="song-meta">
                      <div className="t">{s.title}</div>
                      <div className="a">{s.artist}</div>
                      <div className="tag-row">
                        <span className="tag style">{s.style}</span>
                        <span className={`tag ${parseLRC(s.lrc_text).length ? "ok" : "warn"}`}>
                          {parseLRC(s.lrc_text).length} linhas LRC
                        </span>
                      </div>
                    </div>
                    <div className="queue-actions">
                      <button
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditingSong(s);
                          setLrcDraft(s.lrc_text);
                        }}
                      >
                        Letra
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => act(() => api(`/api/songs/${s.id}`, { method: "DELETE" }))}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <h2 className="section-title">
              <span className="dot" /> Vídeos de fundo ({videos.length})
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 0 }}>
              O palco sorteia um vídeo do estilo da música (ou de todos, se o estilo não tiver vídeo).
            </p>
            {videos.length === 0 ? (
              <div className="empty-state">
                <div className="big">📼</div>
                Nenhum vídeo de fundo ainda.
              </div>
            ) : (
              <div className="song-list" style={{ maxHeight: 260 }}>
                {videos.map((v) => (
                  <div key={v.id} className="song-card">
                    <div className="song-thumb">📼</div>
                    <div className="song-meta">
                      <div className="t" style={{ textTransform: "capitalize" }}>{v.style}</div>
                      <div className="a">{v.mp4_path}</div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => act(() => api(`/api/videos/${v.id}`, { method: "DELETE" }))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingSong && (
        <div className="modal-bg">
          <div className="modal lrc-modal">
            <h2 className="section-title">
              <span className="dot" /> Editar letra — {editingSong.title}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 0 }}>
              Cole o LRC da <b>mesma gravação do mp3</b> (versão de estúdio × ao vivo têm tempos
              diferentes). Linhas no formato <code>[mm:ss.xx] letra</code>.
            </p>
            <textarea
              className="lrc-textarea"
              value={lrcDraft}
              onChange={(e) => setLrcDraft(e.target.value)}
              spellCheck={false}
            />
            <p style={{ fontSize: 12.5, margin: "8px 0" }}>
              {parseLRC(lrcDraft).length ? (
                <span style={{ color: "var(--cyan)" }}>
                  ✓ {parseLRC(lrcDraft).length} linhas sincronizadas reconhecidas
                </span>
              ) : (
                <span style={{ color: "#ff6b8f" }}>
                  Nenhuma linha sincronizada reconhecida — confira o formato.
                </span>
              )}
            </p>
            <div className="queue-actions" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" disabled={savingLrc} onClick={() => setEditingSong(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                disabled={savingLrc || !lrcDraft.trim() || parseLRC(lrcDraft).length === 0}
                onClick={async () => {
                  setSavingLrc(true);
                  try {
                    await api(`/api/songs/${editingSong.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ lrc_text: lrcDraft }),
                    });
                    setEditingSong(null);
                    await refresh();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Falha ao salvar a letra.");
                  } finally {
                    setSavingLrc(false);
                  }
                }}
              >
                {savingLrc ? "Salvando..." : "Salvar letra"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- cadastro de música ---------------- */

function AddSongPanel({
  styles,
  onAdded,
  onError,
}: {
  styles: string[];
  onAdded: () => void;
  onError: (m: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [style, setStyle] = useState("");
  const [mp3, setMp3] = useState<File | null>(null);
  const [lrc, setLrc] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const ready = title.trim() && artist.trim() && style.trim() && mp3 && lrc && !busy;

  async function add() {
    if (!mp3 || !lrc) return;
    try {
      setBusy("Lendo letra...");
      const lrcText = await lrc.text();
      if (parseLRC(lrcText).length === 0) {
        throw new Error("O arquivo LRC não tem linhas sincronizadas válidas.");
      }
      setBusy("Enviando MP3 para o Storage...");
      const mp3Path = await uploadMedia("mp3", mp3);
      setBusy("Salvando música...");
      await api("/api/songs", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim(),
          style: style.trim(),
          mp3_path: mp3Path,
          lrc_text: lrcText,
        }),
      });
      setTitle("");
      setArtist("");
      setMp3(null);
      setLrc(null);
      formRef.current?.querySelectorAll("input[type=file]").forEach((i) => ((i as HTMLInputElement).value = ""));
      onAdded();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Falha ao cadastrar música.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="panel" ref={formRef}>
      <h2 className="section-title">
        <span className="dot" /> Adicionar música
      </h2>
      <div className="field">
        <label>Título da música</label>
        <input type="text" placeholder="Ex: Evidências" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label>Artista</label>
        <input type="text" placeholder="Ex: Chitãozinho & Xororó" value={artist} onChange={(e) => setArtist(e.target.value)} />
      </div>
      <div className="field">
        <label>Estilo</label>
        <input
          type="text"
          list="style-options"
          placeholder="Ex: sertanejo"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
        <datalist id="style-options">
          {styles.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <FilePick
        badge="mp3"
        icon="♪"
        label="Áudio (MP3)"
        hint="Clique para escolher o arquivo .mp3"
        accept="audio/mpeg,audio/mp3,.mp3"
        file={mp3}
        onFile={(f) => {
          setMp3(f);
          if (!title && f) setTitle(f.name.replace(/\.[^/.]+$/, ""));
        }}
      />
      <FilePick
        badge="lrc"
        icon="✎"
        label="Letra sincronizada (LRC)"
        hint="Clique para escolher o arquivo .lrc"
        accept=".lrc,.txt"
        file={lrc}
        onFile={setLrc}
      />
      <button className="btn btn-primary btn-block" disabled={!ready} onClick={add}>
        {busy ?? "Adicionar à biblioteca"}
      </button>
      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
        O vídeo de fundo não é mais por música: cadastre vídeos por estilo no painel abaixo — o palco sorteia um na hora.
      </p>
    </div>
  );
}

/* ---------------- cadastro de vídeo de fundo ---------------- */

function AddVideoPanel({
  styles,
  onAdded,
  onError,
}: {
  styles: string[];
  onAdded: () => void;
  onError: (m: string) => void;
}) {
  const [style, setStyle] = useState("");
  const [mp4, setMp4] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  async function add() {
    if (!mp4) return;
    try {
      setBusy("Enviando MP4 para o Storage...");
      const mp4Path = await uploadMedia("mp4", mp4);
      setBusy("Salvando vídeo...");
      await api("/api/videos", {
        method: "POST",
        body: JSON.stringify({ style: style.trim(), mp4_path: mp4Path }),
      });
      setStyle("");
      setMp4(null);
      formRef.current?.querySelectorAll("input[type=file]").forEach((i) => ((i as HTMLInputElement).value = ""));
      onAdded();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Falha ao cadastrar vídeo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="panel" ref={formRef}>
      <h2 className="section-title">
        <span className="dot" /> Adicionar vídeo de fundo
      </h2>
      <div className="field">
        <label>Estilo</label>
        <input
          type="text"
          list="style-options"
          placeholder="Ex: sertanejo"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
      </div>
      <FilePick
        badge="mp4"
        icon="▶"
        label="Vídeo (MP4)"
        hint="Clique para escolher o arquivo .mp4"
        accept="video/mp4,.mp4"
        file={mp4}
        onFile={setMp4}
      />
      <button className="btn btn-cyan btn-block" disabled={!style.trim() || !mp4 || !!busy} onClick={add}>
        {busy ?? "Adicionar vídeo"}
      </button>
      <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 10 }}>
        Dica: poucos loops genéricos por estilo (luzes, confete, pista) rendem muito — o plano gratuito do Supabase tem 1GB de arquivos.
      </p>
    </div>
  );
}

/* ---------------- seletor de arquivo no estilo do protótipo ---------------- */

function FilePick({
  badge,
  icon,
  label,
  hint,
  accept,
  file,
  onFile,
}: {
  badge: "mp3" | "mp4" | "lrc";
  icon: string;
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <label className={`file-drop ${file ? "filled" : ""}`}>
        <div className={`icon-badge ${badge}`}>{icon}</div>
        <span>{file ? file.name : hint}</span>
        <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        <span className="pick-btn">Escolher</span>
      </label>
    </div>
  );
}
