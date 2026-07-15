"use client";

import Link from "next/link";
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
  const [finals, setFinals] = useState<{ total: number; best: number } | null>(null);
  const [queueFlash, setQueueFlash] = useState(0);
  // contagem regressiva do início automático; null = sem contagem
  const [countdown, setCountdown] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  // "palco ativado": o navegador só libera áudio automático depois de um
  // clique na página — o anfitrião ativa uma vez no início do evento
  const [armed, setArmed] = useState(false);
  const armedRef = useRef(false);
  // modo "só letra" (?letra=1): teleprompter do convidado — letra
  // sincronizada sem som, sem microfone e sem controles do telão
  const [lyricsOnly, setLyricsOnly] = useState(false);
  const lyricsOnlyRef = useRef(false);
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
      // com o palco ativado a música começa sozinha; sem ativação o
      // navegador bloquearia o áudio, então fica no botão manual
      setCountdown(armedRef.current ? 5 : null);
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
    }
    if (only || navigator.userActivation?.hasBeenActive) {
      armedRef.current = true;
      setArmed(true);
    }
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
    armedRef.current = true;
    setArmed(true);
    // aproveita o clique para já deixar a permissão do microfone concedida
    navigator.mediaDevices
      ?.getUserMedia({ audio: true, video: false })
      .then((stream) => stream.getTracks().forEach((t) => t.stop()))
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
      requestMicAndPlay();
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

  function requestMicAndPlay() {
    if (lyricsOnlyRef.current) {
      beginPlayback(false); // sem microfone: só acompanha a letra
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
      .catch(() => {
        // Sem alert: na TV um modal bloquearia o evento inteiro.
        setToast({ msg: "Sem microfone — a música segue sem pontuação! 🎶", key: Date.now() });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 3500);
        beginPlayback(false);
      });
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
      // nesse caso volta ao estado "ready" e o botão manual assume.
      audio.play().catch(() => {
        stopEngine();
        setPhase("ready");
        setStarting(false);
      });
      video?.play().catch(() => {});
    }
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
    setFinals({ total, best: bestStreakRef.current });
    setPhase("finished");
    const cur = entryRef.current;
    // quem encerra a apresentação na fila é o telão — o teleprompter não
    if (cur && !lyricsOnlyRef.current) {
      api(`/api/queue/${cur.id}/done`, { method: "POST" }).catch(() => {});
    }
  }

  function closeModal() {
    setFinals(null);
    setEntry(null);
    setPhase("idle");
  }

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
                      requestMicAndPlay();
                    }}
                  >
                    Começar agora ⏩
                  </button>
                </div>
              )}
              {phase === "ready" && countdown === null && starting && (
                <div className="stage-center-overlay">
                  <div className="overlay-sub">🎙️ Preparando o microfone...</div>
                </div>
              )}
              {phase === "ready" && countdown === null && !starting && (
                <div className="stage-center-overlay">
                  <div className="overlay-sub">{entry.singer_name}, é a sua vez!</div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      armedRef.current = true;
                      setArmed(true);
                      setStarting(true);
                      requestMicAndPlay();
                    }}
                  >
                    🎙️ Iniciar a música
                  </button>
                  {!armed && (
                    <div className="overlay-hint">
                      Este primeiro clique ativa o palco — as próximas músicas começam sozinhas.
                    </div>
                  )}
                </div>
              )}
              {phase === "finished" && lyricsOnly && (
                <div className="stage-center-overlay">
                  <div className="grade-big">👏</div>
                  <div className="overlay-sub">
                    Mandou bem, {entry.singer_name}!
                    <br />A pontuação aparece no telão.
                  </div>
                  <Link href="/entrar" className="btn btn-primary">
                    Voltar para a fila 🎶
                  </Link>
                </div>
              )}
              {phase === "finished" && !lyricsOnly && finals && grade && (
                <div className="stage-center-overlay">
                  <div className="grade-big">{grade.grade}</div>
                  <div className="score-big">{finals.total} / 100</div>
                  <div className="overlay-sub">
                    <b>{grade.label}</b>
                    <br />
                    {entry.singer_name} cantou &quot;{entry.songs.title}&quot; · maior sequência:{" "}
                    {finals.best} linhas
                  </div>
                  <button className="btn btn-primary" onClick={closeModal}>
                    Chamar o próximo cantor
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
                {!armed && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <button className="btn btn-primary" onClick={armStage}>
                      🎬 Ativar palco
                    </button>
                    <div className="overlay-hint">
                      Clique uma vez no início do evento: libera o som e o microfone para as
                      apresentações começarem sozinhas.
                    </div>
                  </div>
                )}
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
