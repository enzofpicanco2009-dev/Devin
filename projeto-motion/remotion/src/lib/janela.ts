import { useCurrentFrame, useVideoConfig } from "remotion";

/** Curvas de easing usadas pelos templates. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Progresso 0→1 de uma "janela" definida como fração da duração da cena
 * (ex.: 0.15→0.75 = começa em 15% e termina em 75% da cena). Faz a animação
 * se adaptar a cenas curtas e longas sem mexer em frames.
 * `maxS` limita a duração real da janela para cenas muito longas.
 */
export function useJanela(
  inicioFrac: number,
  fimFrac: number,
  opts: { easing?: (t: number) => number; maxS?: number; minS?: number } = {},
): number {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const dur = durationInFrames / fps;
  const t = frame / fps;
  let inicio = dur * inicioFrac;
  let comprimento = dur * (fimFrac - inicioFrac);
  if (opts.maxS !== undefined) comprimento = Math.min(comprimento, opts.maxS);
  if (opts.minS !== undefined) comprimento = Math.max(comprimento, opts.minS);
  inicio = Math.min(inicio, Math.max(0, dur - comprimento));
  const p = comprimento <= 0 ? 1 : (t - inicio) / comprimento;
  const c = Math.min(1, Math.max(0, p));
  return (opts.easing ?? easeOutCubic)(c);
}
