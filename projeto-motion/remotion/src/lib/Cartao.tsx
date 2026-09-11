import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { BaseProps } from "./base";

/** Escala para valores calibrados em 1080p (menor lado). */
export function useEscala(): number {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 1080;
}

/** Fade in/out da cena inteira + safe area. */
export const Cartao: React.FC<
  React.PropsWithChildren<
    BaseProps & { justify?: React.CSSProperties["justifyContent"] }
  >
> = ({ children, justify = "center", ...p }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opIn = interpolate(frame, [0, p.entradaFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opOut = interpolate(
    frame,
    [durationInFrames - p.saidaFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ backgroundColor: p.corFundo }}>
      <AbsoluteFill
        style={{
          justifyContent: justify,
          alignItems: "center",
          paddingTop: `${p.safeArea.topo}%`,
          paddingBottom: `${p.safeArea.base}%`,
          paddingLeft: `${p.safeArea.lados}%`,
          paddingRight: `${p.safeArea.lados}%`,
          opacity: Math.min(opIn, opOut),
          fontFamily: p.fonte.familia,
          color: p.corTexto,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Progresso 0→1 com spring, começando em `delay` frames. */
export function useEntrada(delay: number, cfg: BaseProps["spring"], dur = 20) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: cfg,
    durationInFrames: dur,
  });
}

export const Rotulo: React.FC<{
  children: React.ReactNode;
  cor: string;
  tamanho: number;
  fonte: BaseProps["fonteCorpo"];
  style?: React.CSSProperties;
}> = ({ children, cor, tamanho, fonte, style }) => (
  <div
    style={{
      fontFamily: fonte.familia,
      fontWeight: fonte.peso,
      fontSize: tamanho,
      color: cor,
      textAlign: "center",
      lineHeight: 1.2,
      ...style,
    }}
  >
    {children}
  </div>
);
