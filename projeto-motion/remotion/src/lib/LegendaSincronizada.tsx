import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { BaseProps } from "./base";

export interface PalavraTempo {
  w: string;
  s: number;
  e: number;
}

interface LegendaSincronizadaProps {
  palavras: PalavraTempo[];
  palavrasPorLinha?: number;
  tema: Pick<BaseProps, "corTexto" | "corDestaque" | "fonteCorpo">;
}

export const LegendaSincronizada: React.FC<LegendaSincronizadaProps> = ({
  palavras,
  palavrasPorLinha = 5,
  tema,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!palavras || palavras.length === 0) return null;

  const tempoAtual = frame / fps;

  const linhas: PalavraTempo[][] = [];
  for (let i = 0; i < palavras.length; i += palavrasPorLinha) {
    linhas.push(palavras.slice(i, i + palavrasPorLinha));
  }

  let linhaAtual = linhas[0];
  for (const linha of linhas) {
    const inicio = linha[0].s;
    const fim = linha[linha.length - 1].e;
    if (tempoAtual >= inicio && tempoAtual <= fim) {
      linhaAtual = linha;
      break;
    }
    if (tempoAtual > fim) {
      linhaAtual = linha;
    }
  }

  if (!linhaAtual) return null;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "6%",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          borderRadius: 8,
          padding: "10px 18px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "85%",
          gap: "0.35em",
        }}
      >
        {linhaAtual.map((palavra, idx) => {
          const ativa = tempoAtual >= palavra.s && tempoAtual <= palavra.e;
          return (
            <span
              key={`${palavra.w}-${idx}`}
              style={{
                fontFamily: tema.fonteCorpo.familia,
                fontSize: 32,
                color: ativa ? tema.corDestaque : tema.corTexto,
                transform: ativa ? "scale(1.08)" : "scale(1)",
                display: "inline-block",
                fontWeight: ativa ? 700 : 500,
              }}
            >
              {palavra.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
