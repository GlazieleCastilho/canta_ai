// Detecção de pitch por autocorrelação, portada do protótipo (karaoke.html)
// — algoritmo inalterado.

export type PitchSample = { pitch: number; rms: number };

export function autoCorrelate(buf: Float32Array, sampleRate: number): PitchSample {
  const SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.012) return { pitch: -1, rms };
  let r1 = 0,
    r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }
  const trimmed = buf.slice(r1, r2);
  const n = trimmed.length;
  if (n < 8) return { pitch: -1, rms };
  const c = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i];
    }
  }
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;
  let maxVal = -1,
    maxPos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  let T0 = maxPos;
  if (T0 <= 0) return { pitch: -1, rms };
  const x1 = c[T0 - 1] || 0,
    x2 = c[T0] || 0,
    x3 = c[T0 + 1] || 0;
  const a = (x1 + x3 - 2 * x2) / 2,
    b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);
  const pitch = sampleRate / T0;
  return { pitch: pitch > 60 && pitch < 1200 ? pitch : -1, rms };
}

/** Pontuação de uma linha a partir das amostras do microfone — lógica do protótipo. */
export function scoreLineSamples(samples: PitchSample[]): number | null {
  if (!samples.length) return null;
  const voiced = samples.filter((s) => s.pitch > 0);
  const activity = voiced.length / samples.length;
  let stability = 0;
  if (voiced.length > 2) {
    const cents = voiced.map((s) => 1200 * Math.log2(s.pitch / 110));
    const mean = cents.reduce((a, b) => a + b, 0) / cents.length;
    const variance = cents.reduce((a, b) => a + (b - mean) * (b - mean), 0) / cents.length;
    stability = Math.max(0, 1 - Math.min(1, Math.sqrt(variance) / 500));
  }
  let lineScore = Math.round(activity * 70 + stability * 30);
  if (activity < 0.15) lineScore = Math.round(lineScore * 0.4);
  return lineScore;
}
