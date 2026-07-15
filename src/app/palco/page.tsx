"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import { parseLRC, type LrcLine } from "@/karaoke/lrc";
import { autoCorrelate, scoreLineSamples, type PitchSample } from "@/karaoke/pitch";
import { finalGrade, pickToastMessage } from "@/karaoke/messages";
import type { BackgroundVideo, QueueEntry } from "@/lib/types";
import { mediaUrl } from "@/lib/types";

type Phase = "idle" | "ready" | "playing" | "finished";

export default function PalcoPage() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lyrics, setLyrics] = useState({ prev: " ", current: "Prepare-se...", next: " " });
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  // scored = teve microfone durante a apresentação (pontuação é opcional)
  const [finals, setFinals] = useState<{ total: number; best: number; scored: boolean } | null>(null);
  const [micGranted, setMicGranted] = useState(false);
  const [queueFlash, setQueueFlash] = useState(0);
  // contagem regressiva do início automático; null = sem contagem
  const [countdown, setCountdown] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  // contagem para chamar o próximo cantor sozinho após o placar final
  const [nextIn, setNextIn] = useState<number | null>(null);
  // "palco ativado": o navegador só libera áudio automático depois de um
  // clique na página — o anfitrião ativa uma vez no início do evento
  const [armed, setArmed] = useState(false);
  // modo "só letra" (?letra=1): teleprompter do convidado — letra
  // sincronizada sem som, sem microfone e sem controles do telão
  const [lyricsOnly, setLyricsOnly] = useState(false);
  const lyricsOnlyRef = useRef(false);
  // QR fixo no canto do telão para os convidados entrarem na fila
  const [entrarUrl, setEntrarUrl] = useState("");
  // relógio do modo "só letra": marca o instante do início e a letra corre
  // por tempo decorrido — imune a autoplay bloqueado e aba em segundo plano
  const startTsRef = useRef(0);
  // popup dos próximos da fila: fixo só no palco vazio; em cena aparece
  // alguns segundos quando a fila muda e desliza para fora
  const [alertVisible, setAlertVisible] = useState(true);

  // refs do motor de performance (portado do protótipo)
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const micBarRef = useRef<HTMLElement>(null);
  const lrcRef = useRef<LrcLine[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micBufRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pitchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lineSamplesRef = useRef<PitchSample[]>([]);
  const lineScoresRef = useRef<number[]>([]);
  const curLineIdxRef = useRef(-1);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const entryRef = useRef<QueueEntry | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micUsedRef = useRef(false);
  phaseRef.current = phase;
  entryRef.current = entry;

  /* ---------- fila (polling) ---------- */

  const prevWaitingCount = useRef(0);
  const pollQueue = useCallback(async () => {
    let q: QueueEntry[];
    try {
      q = await api<QueueEntry[]>("/api/queue");
    } catch {
      return; // tenta no próximo tick
    }
    setQueue(q);

    const waiting = q.filter((e) => e.status === "waiting");
    if (waiting.length > prevWaitingCount.current) setQueueFlash((k) => k + 1);
    prevWaitingCount.current = waiting.length;

    const performing = q.find((e) => e.status === "performing") ?? null;
    const cur = entryRef.current;

    if (performing && performing.songs && (!cur || cur.id !== performing.id)) {
      // admin chamou alguém (novo ou trocou no meio) — carrega no palco
      if (phaseRef.current === "playing") stopEngine();
      lrcRef.current = parseLRC(performing.songs.lrc_text);
      setEntry(performing);
      setLyrics({ prev: " ", current: "Prepare-se...", next: " " });
      setScore(0);
      setStreak(0);
      setFinals(null);
      setPhase("ready");
      setStarting(false);
      // sempre tenta o início automático; se o navegador bloquear o som
      // (falta de interação), o beginPlayback recua para o botão manual
      setCountdown(5);
      pickVideo(performing.songs.style);
    } else if (!performing && cur && phaseRef.current === "ready") {
      // admin removeu/encerrou antes de começar
      setEntry(null);
      setPhase("idle");
      setCountdown(null);
      setStarting(false);
    }
  }, []);

  // Se a página já recebeu interação (ex: veio do /entrar via redirect),
  // o navegador já libera o autoplay — dá pra armar o palco direto.
  // No modo "só letra" o áudio fica mudo (autoplay mudo é sempre
  // permitido), então arma incondicionalmente.
  useEffect(() => {
    const only = new URLSearchParams(window.location.search).has("letra");
    if (only) {
      lyricsOnlyRef.current = true;
      setLyricsOnly(true);
    } else {
      setEntrarUrl(`${window.location.origin}/entrar`);
    }
    if (only || navigator.userActivation?.hasBeenActive) {
      setArmed(true);
    }
    // esconde o botão de pontuação se o microfone já foi autorizado antes
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((st) => setMicGranted(st.state === "granted"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    pollQueue();
    const t = setInterval(pollQueue, 3000);
    return () => {
      clearInterval(t);
      stopEngine();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- visibilidade do popup da fila ---------- */

  useEffect(() => {
    setAlertVisible(phase === "idle");
  }, [phase]);

  useEffect(() => {
    if (queueFlash === 0 || phaseRef.current === "idle") return;
    setAlertVisible(true);
    const t = setTimeout(() => setAlertVisible(false), 5000);
    return () => clearTimeout(t);
  }, [queueFlash]);

  /* ---------- ativação do palco (1 clique no início do evento) ---------- */

  function armStage() {
    setArmed(true); // só destrava o som — microfone é opcional, à parte
  }

  /**
   * Pontuação por microfone é OPCIONAL: em evento real o microfone do
   * cantor costuma ser externo (caixa amplificada), então nunca pedimos
   * permissão no meio do show. Este botão ativa de propósito.
   */
  function enableScoring() {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop());
        setMicGranted(true);
        setToast({ msg: "Pontuação por microfone ativada! 🎙️", key: Date.now() });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3000);
      })
      .catch(() => {});
  }

  /* ---------- contagem regressiva e início automático ---------- */

  useEffect(() => {
    if (countdown === null) return;
    if (phaseRef.current !== "ready") {
      setCountdown(null);
      return;
    }
    if (countdown <= 0) {
      setCountdown(null);
      setStarting(true);
      startPerformance();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  /* ---------- sorteio do vídeo de fundo (seção 8 do plano) ---------- */

  async function pickVideo(style: string) {
    if (lyricsOnlyRef.current) {
      setVideoPath(null); // teleprompter não gasta banda com vídeo
      return;
    }
    try {
      const videos = await api<BackgroundVideo[]>("/api/videos");
      const sameStyle = videos.filter((v) => v.style === style);
      const pool = sameStyle.length ? sameStyle : videos;
      setVideoPath(pool.length ? pool[Math.floor(Math.random() * pool.length)].mp4_path : null);
    } catch {
      setVideoPath(null);
    }
  }

  /* ---------- motor de performance (portado do protótipo) ---------- */

  /**
   * Inicia a apresentação. NUNCA pede permissão de microfone aqui: a
   * pontuação só entra se a permissão já foi concedida antes (botão
   * "Ativar pontuação"). Sem microfone, a música toca normalmente.
   */
  async function startPerformance() {
    if (lyricsOnlyRef.current) {
      beginPlayback(false); // teleprompter: só acompanha a letra
      return;
    }
    let granted = false;
    try {
      const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
      granted = st.state === "granted";
    } catch {
      granted = false; // navegador sem a API — segue sem pontuação
    }
    if (!granted) {
      beginPlayback(false);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        micBufRef.current = new Float32Array(analyser.fftSize);
        micSourceRef.current = ctx.createMediaStreamSource(stream);
        micSourceRef.current.connect(analyser);
        beginPlayback(true);
      })
      .catch(() => beginPlayback(false));
  }

  function beginPlayback(micReady: boolean) {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    if (video) video.currentTime = 0;
    if (lyricsOnlyRef.current) {
      // teleprompter: não toca nada — só marca o início do relógio
      startTsRef.current = performance.now();
    } else {
      // Autoplay pode ser bloqueado se o navegador ainda não teve interação:
      // nesse caso volta ao estado "ready" e o botão manual assume. Se o
      // problema for o arquivo de áudio (não carrega), avisa na tela em vez
      // de falhar em silêncio.
      audio.play().catch(() => {
        stopEngine();
        setPhase("ready");
        setStarting(false);
        if (audio.error || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          setToast({
            msg: "Não consegui carregar o áudio desta música 😢 Confira o arquivo no painel.",
            key: Date.now(),
          });
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => setToast(null), 5000);
        }
      });
      video?.play().catch(() => {});
    }
    micUsedRef.current = micReady;
    lineScoresRef.current = [];
    streakRef.current = 0;
    bestStreakRef.current = 0;
    curLineIdxRef.current = -1;
    lineSamplesRef.current = [];
    setScore(0);
    setStreak(0);
    setPhase("playing");

    // vídeo segue o áudio (o áudio é o relógio-mestre) — lógica do protótipo;
    // no modo "só letra" o relógio é o tempo decorrido desde o início
    syncTimerRef.current = setInterval(() => {
      const a = audioRef.current,
        v = videoRef.current;
      if (!a) return;
      const only = lyricsOnlyRef.current;
      const t = only ? (performance.now() - startTsRef.current) / 1000 : a.currentTime;
      if (!only && v && Math.abs(v.currentTime - a.currentTime) > 0.35) {
        v.currentTime = a.currentTime;
      }
      updateLyrics(t);
      updateFill(t);
      const lastLine = lrcRef.current[lrcRef.current.length - 1];
      const acabou = only ? t >= (a.duration || (lastLine?.time ?? 0) + 6) : a.ended;
      if (acabou) endPerformance();
    }, 120);

    if (micReady) {
      pitchTimerRef.current = setInterval(sampleMic, 60);
    }
  }

  function updateLyrics(t: number) {
    const lrc = lrcRef.current;
    if (!lrc.length) return;
    let idx = -1;
    for (let i = 0; i < lrc.length; i++) {
      if (lrc[i].time <= t) idx = i;
      else break;
    }
    if (idx !== curLineIdxRef.current) {
      if (curLineIdxRef.current >= 0) scoreLine();
      curLineIdxRef.current = idx;
      lineSamplesRef.current = [];
      setLyrics({
        prev: idx > 0 ? lrc[idx - 1].text : " ",
        current: idx >= 0 ? lrc[idx].text : "Prepare-se...",
        next: idx >= 0 && idx + 1 < lrc.length ? lrc[idx + 1].text : " ",
      });
    }
  }

  /** Preenchimento amarelo da linha atual, interpolado entre o início dela e a próxima. */
  function updateFill(t: number) {
    const el = fillRef.current;
    if (!el) return;
    const lrc = lrcRef.current;
    const i = curLineIdxRef.current;
    if (i < 0 || i >= lrc.length) {
      el.style.setProperty("--fill", "0%");
      return;
    }
    const start = lrc[i].time;
    const end = i + 1 < lrc.length ? lrc[i + 1].time : (audioRef.current?.duration ?? start + 5);
    const pct = Math.max(0, Math.min(1, (t - start) / Math.max(0.001, end - start)));
    el.style.setProperty("--fill", `${(pct * 100).toFixed(1)}%`);
  }

  function sampleMic() {
    const analyser = analyserRef.current,
      buf = micBufRef.current,
      ctx = audioCtxRef.current;
    if (!analyser || !buf || !ctx) return;
    analyser.getFloatTimeDomainData(buf);
    const sample = autoCorrelate(buf, ctx.sampleRate);
    const vol = Math.min(1, sample.rms * 9);
    if (micBarRef.current) micBarRef.current.style.width = `${(vol * 100).toFixed(0)}%`;
    lineSamplesRef.current.push(sample);
  }

  function scoreLine() {
    const lineScore = scoreLineSamples(lineSamplesRef.current);
    if (lineScore === null) return;
    lineScoresRef.current.push(lineScore);

    if (lineScore >= 65) {
      streakRef.current++;
      bestStreakRef.current = Math.max(bestStreakRef.current, streakRef.current);
    } else {
      streakRef.current = 0;
    }

    const total = Math.round(lineScoresRef.current.reduce((a, b) => a + b, 0) / lineScoresRef.current.length);
    setScore(total);
    setStreak(streakRef.current);

    const msg = pickToastMessage(lineScore, streakRef.current);
    if (msg) {
      setToast({ msg, key: Date.now() });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 1600);
    }
  }

  function stopEngine() {
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    if (pitchTimerRef.current) clearInterval(pitchTimerRef.current);
    syncTimerRef.current = null;
    pitchTimerRef.current = null;
    audioRef.current?.pause();
    videoRef.current?.pause();
    try {
      micSourceRef.current?.mediaStream.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
    micSourceRef.current = null;
  }

  function endPerformance() {
    if (phaseRef.current !== "playing") return;
    if (curLineIdxRef.current >= 0) scoreLine();
    stopEngine();
    const scores = lineScoresRef.current;
    const total = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    setFinals({ total, best: bestStreakRef.current, scored: micUsedRef.current });
    setPhase("finished");
    const cur = entryRef.current;
    // quem encerra a apresentação na fila é o telão — o teleprompter não
    if (cur && !lyricsOnlyRef.current) {
      api(`/api/queue/${cur.id}/done`, { method: "POST" }).catch(() => {});
      setNextIn(10); // placar fica na tela e o próximo é chamado sozinho
    }
  }

  /** Chama o próximo da fila e limpa o palco (o poll carrega quem vier). */
  async function callNext() {
    setNextIn(null);
    setFinals(null);
    setEntry(null);
    setPhase("idle");
    try {
      await api("/api/queue/next", { method: "POST" });
    } catch {
      /* fila vazia ou corrida com o admin — o poll resolve */
    }
    pollQueue();
  }

  useEffect(() => {
    if (nextIn === null) return;
    if (phaseRef.current !== "finished") {
      setNextIn(null);
      return;
    }
    if (nextIn <= 0) {
      callNext();
      return;
    }
    const t = setTimeout(() => setNextIn((n) => (n === null ? null : n - 1)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextIn]);

  /* ---------- render ---------- */

  const waiting = queue.filter((q) => q.status === "waiting").slice(0, 5);
  const grade = finals ? finalGrade(finals.total) : null;

  return (
    <div className="center-page">
      <div className="chase-lights" />
      <main style={{ paddingTop: 16 }}>
        <div className="stage-wrap">
          {!lyricsOnly && (
            <Link href="/admin" className="stage-back" aria-label="Voltar ao painel" title="Voltar ao painel">
              ←
            </Link>
          )}
          {!lyricsOnly && entrarUrl && (
            <div className="stage-qr">
              <QRCodeCanvas value={entrarUrl} size={88} marginSize={2} />
              <span>📱 Entre na fila</span>
            </div>
          )}
          {entry && entry.songs ? (
            <>
              {videoPath && (
                <video
                  ref={videoRef}
                  className="stage-video"
                  src={mediaUrl(videoPath)}
                  muted
                  loop
                  playsInline
                />
              )}
              <div className="stage-overlay-grad" />
              <audio ref={audioRef} src={mediaUrl(entry.songs.mp3_path)} />
              {toast && (
                <div key={toast.key} className="toast-msg show">
                  {toast.msg}
                </div>
              )}
              <QueueAlert waiting={waiting} flash={queueFlash} visible={alertVisible} />

              <div className="stage-content">
                <div className="now-singing">
                  <div className="song-title">{entry.songs.title}</div>
                  <div className="singer">
                    🎤 {entry.singer_name} está cantando · {entry.songs.artist}
                  </div>
                </div>

                <div className="lyrics-zone">
                  <div className="lyric-prev">{lyrics.prev}</div>
                  <div className="lyric-current">
                    {phase === "ready" ? (
                      `${entry.singer_name}, é a sua vez!`
                    ) : (
                      <span className="karaoke-fill" ref={fillRef} key={lyrics.current}>
                        {lyrics.current}
                      </span>
                    )}
                  </div>
                  <div className="lyric-next">{lyrics.next}</div>
                </div>

                {phase === "playing" && !lyricsOnly && (
                  <div className="stage-bottom-controls">
                    <button className="btn btn-danger" onClick={endPerformance}>
                      Encerrar performance
                    </button>
                  </div>
                )}
                {phase === "playing" && lyricsOnly && (
                  <div className="stage-bottom-controls">
                    <div className="overlay-hint">O som toca no telão — acompanhe a letra por aqui 📺</div>
                  </div>
                )}
              </div>

              {phase === "ready" && countdown !== null && (
                <div className="stage-center-overlay">
                  <div className="overlay-sub">{entry.singer_name}, é a sua vez!</div>
                  <div className="countdown-num" key={countdown}>
                    {countdown}
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setCountdown(null);
                      setStarting(true);
                      startPerformance();
                    }}
                  >
                    Começar agora ⏩
                  </button>
                </div>
              )}
              {phase === "ready" && countdown === null && starting && (
                <div className="stage-center-overlay">
                  <div className="overlay-sub">🎶 Preparando...</div>
                </div>
              )}
              {phase === "ready" && countdown === null && !starting && (
                <div className="stage-center-overlay">
                  <div className="overlay-sub">{entry.singer_name}, é a sua vez!</div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setArmed(true);
                      setStarting(true);
                      startPerformance();
                    }}
                  >
                    ▶️ Iniciar a música
                  </button>
                  <div className="overlay-hint">
                    O navegador bloqueou o início automático — este toque libera o som para o
                    resto do evento.
                  </div>
                </div>
              )}
              {phase === "finished" && lyricsOnly && (
                <div className="stage-center-overlay">
                  <div className="grade-big">👏</div>
                  <div className="overlay-sub">
                    Mandou bem, {entry.singer_name}!
                    <br />O resultado aparece no telão.
                  </div>
                  <Link href="/entrar" className="btn btn-primary">
                    Voltar para a fila 🎶
                  </Link>
                </div>
              )}
              {phase === "finished" && !lyricsOnly && finals && (
                <div className="stage-center-overlay">
                  <div className="grade-big">{finals.scored && grade ? grade.grade : "👏"}</div>
                  {finals.scored && <div className="score-big">{finals.total} / 100</div>}
                  <div className="overlay-sub">
                    {finals.scored && grade ? (
                      <>
                        <b>{grade.label}</b>
                        <br />
                        {entry.singer_name} cantou &quot;{entry.songs.title}&quot; · maior
                        sequência: {finals.best} linhas
                      </>
                    ) : (
                      <>
                        Aplausos para <b>{entry.singer_name}</b>!
                        <br />
                        &quot;{entry.songs.title}&quot; — {entry.songs.artist}
                      </>
                    )}
                  </div>
                  {nextIn !== null && (
                    <div className="overlay-hint">
                      {waiting.length
                        ? `Chamando ${waiting[0].singer_name} em ${nextIn}s...`
                        : `Fechando em ${nextIn}s — a fila está vazia.`}
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={callNext}>
                    {waiting.length ? "Chamar o próximo agora ⏩" : "Liberar o palco"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <QueueAlert waiting={waiting} flash={queueFlash} visible={alertVisible} />
              <div className="empty-stage">
                <div className="big">🎙️</div>
                <div>
                  <h2 className="section-title" style={{ justifyContent: "center" }}>
                    Nenhum cantor no palco
                  </h2>
                  <p style={{ color: "var(--muted)", fontSize: 13.5 }}>
                    {waiting.length
                      ? "Chame o próximo cantor pelo painel do anfitrião."
                      : "Aponte a câmera para o QR code e entre na fila! 🎶"}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  {!armed && (
                    <>
                      <button className="btn btn-primary" onClick={armStage}>
                        🎬 Ativar palco
                      </button>
                      <div className="overlay-hint">
                        Recomendado no início do evento: um toque libera o som, garantindo que
                        todas as músicas comecem sozinhas.
                      </div>
                    </>
                  )}
                  {!micGranted && (
                    <>
                      <button className="btn btn-ghost" onClick={enableScoring}>
                        🎙️ Ativar pontuação (opcional)
                      </button>
                      <div className="overlay-hint">
                        Usa o microfone do computador para dar nota aos cantores. Se o microfone
                        do evento é externo (caixa amplificada), pode ignorar — a música toca
                        normalmente sem isso.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <div className="chase-lights pink" />
    </div>
  );
}

/* ---------- alerta com os próximos da fila (canto superior) ---------- */

function QueueAlert({
  waiting,
  flash,
  visible,
}: {
  waiting: QueueEntry[];
  flash: number;
  visible: boolean;
}) {
  return (
    <div key={flash} className={`queue-alert ${flash ? "flash" : ""} ${visible ? "" : "hidden"}`}>
      <h4>🔔 Próximos na fila</h4>
      {waiting.length ? (
        <ol>
          {waiting.map((q) => (
            <li key={q.id}>
              {q.singer_name}
              <span>{q.songs?.title ?? ""}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty">Ninguém na fila ainda.</div>
      )}
    </div>
  );
}
