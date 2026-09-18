import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ajustarTexto } from "../../lib/layoutTexto";
import type { TituloImpactoProps } from "./schema";

const normalizar = (s: string) =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const TituloImpacto: React.FC<TituloImpactoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const escala = Math.min(width, height) / 1080;
  const layout = props.linhas
    ? { linhas: props.linhas, tamanhoFonte: props.tamanhoFonte }
    : ajustarTexto(props.texto, {
        tamanhoMax: props.tamanhoFonte,
        tamanhoMin: 48,
        maxLinhas: 3,
        maxCaracteresLinha: 28,
      });

  const entrada = spring({
    frame,
    fps,
    config: props.spring,
    durationInFrames: props.entradaFrames,
  });
  const opacidadeIn = interpolate(frame, [0, props.entradaFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(
    entrada,
    [0, 1],
    [props.deslocamentoEntradaPx * escala, 0],
  );
  const opacidadeOut = interpolate(
    frame,
    [durationInFrames - props.saidaFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacidade = Math.min(opacidadeIn, opacidadeOut);

  const destaques = new Set(props.palavrasDestaque.map(normalizar));

  return (
    <AbsoluteFill style={{ backgroundColor: props.corFundo }}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: `${props.safeArea.topo}%`,
          paddingBottom: `${props.safeArea.base}%`,
          paddingLeft: `${props.safeArea.lados}%`,
          paddingRight: `${props.safeArea.lados}%`,
          opacity: opacidade,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            fontFamily: props.fonte.familia,
            fontWeight: props.fonte.peso,
            fontSize: layout.tamanhoFonte * escala,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: props.corTexto,
            textAlign: "center",
            maxWidth: width,
          }}
        >
          {layout.linhas.map((linha, i) => (
            <div key={i}>
              {linha.split(" ").map((palavra, j) => (
                <span
                  key={j}
                  style={{
                    color: destaques.has(normalizar(palavra))
                      ? props.corDestaque
                      : undefined,
                  }}
                >
                  {palavra}
                  {j < linha.split(" ").length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
