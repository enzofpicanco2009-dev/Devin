import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";

/**
 * Legenda no ritmo da fala como cena própria: texto grande, centralizado no meio
 * da tela; cada palavra acende no instante em que é falada (tempos relativos ao
 * início da cena). `texto` é editável — quando difere das palavras do Whisper, os
 * tempos são redistribuídos proporcionalmente pelo pipeline.
 */
const palavraSchema = z.object({
  w: z.string(),
  s: z.number().min(0),
  e: z.number().min(0),
});

export const schema = baseSchema.extend({
  palavras: z.array(palavraSchema).default([]),
  palavrasDestaque: z.array(z.string()).default([]),
  tamanho: z.number().min(24).max(160).default(72),
});
export type Props = z.infer<typeof schema>;

export const defaultProps: Props = schema.parse({
  duracaoEmSegundos: 4,
  palavras: [
    { w: "Cada", s: 0, e: 0.4 },
    { w: "palavra", s: 0.4, e: 0.9 },
    { w: "acende", s: 0.9, e: 1.4 },
    { w: "na", s: 1.4, e: 1.6 },
    { w: "hora", s: 1.6, e: 2.0 },
    { w: "certa.", s: 2.0, e: 2.6 },
  ],
  palavrasDestaque: ["acende"],
});

const limpar = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

export const LegendaSincronizada: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const destaque = new Set(p.palavrasDestaque.map(limpar));
  const opOut = interpolate(
    frame,
    [durationInFrames - p.saidaFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: p.corFundo,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8%",
        opacity: opOut,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          gap: `0.15em 0.3em`,
          maxWidth: "100%",
          textAlign: "center",
          fontFamily: p.fonte.familia,
          fontWeight: p.fonte.peso,
          fontSize: p.tamanho,
          lineHeight: 1.2,
        }}
      >
        {p.palavras.map((pal, i) => {
          const dita = t >= pal.s;
          const ativa = dita && t < Math.max(pal.e, pal.s + 0.15);
          const entrada = interpolate(t, [pal.s, pal.s + 0.12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const forte = destaque.has(limpar(pal.w));
          return (
            <span
              key={`${i}-${pal.w}`}
              style={{
                display: "inline-block",
                color: forte
                  ? p.corDestaque
                  : dita
                    ? p.corTexto
                    : `${p.corTexto}55`,
                opacity: 0.35 + 0.65 * entrada,
                transform: `translateY(${(1 - entrada) * 12}px) scale(${ 
                  ativa ? 1.06 : 1
                })`,
                transformOrigin: "center bottom",
              }}
            >
              {pal.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
