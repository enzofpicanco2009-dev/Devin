import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PlanilhaProps } from "./schema";

export const Planilha: React.FC<PlanilhaProps> = ({
  titulo,
  colunas,
  linhas,
  destacar_coluna,
  destacar_linha,
  corFundo,
  corTexto,
  corTextoSecundario,
  corDestaque,
  fonte,
  fonteCorpo,
  safeArea,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPorLinha = fps * 0.35;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: corFundo,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingTop: `${safeArea.topo}%`,
        paddingBottom: `${safeArea.base}%`,
        paddingLeft: `${safeArea.lados}%`,
        paddingRight: `${safeArea.lados}%`,
      }}
    >
      {titulo && (
        <div
          style={{
            fontFamily: fonte.familia,
            fontSize: 50,
            color: corTexto,
            marginBottom: 26,
          }}
        >
          {titulo}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${colunas.length}, minmax(120px, 1fr))`,
          border: `1px solid ${corTextoSecundario}40`,
          borderRadius: 6,
          overflow: "hidden",
          minWidth: "70%",
        }}
      >
        {colunas.map((coluna, c) => (
          <div
            key={`header-${c}`}
            style={{
              backgroundColor: corTextoSecundario,
              color: corFundo,
              fontFamily: fonteCorpo.familia,
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 14px",
              borderRight: c < colunas.length - 1 ? `1px solid ${corFundo}30` : undefined,
              outline: destacar_coluna === c ? `2px solid ${corDestaque}` : undefined,
            }}
          >
            {coluna}
          </div>
        ))}

        {linhas.map((linha, r) => {
          const inicioLinha = (r + 1) * framesPorLinha;
          const opacity = interpolate(
            frame,
            [inicioLinha, inicioLinha + fps * 0.25],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const translateY = interpolate(
            frame,
            [inicioLinha, inicioLinha + fps * 0.25],
            [12, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const linhaDestacada = destacar_linha === r;
          const corFundoZebra = r % 2 === 0 ? "transparent" : `${corTextoSecundario}12`;

          return linha.map((celula, c) => (
            <div
              key={`cell-${r}-${c}`}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                backgroundColor: linhaDestacada ? `${corDestaque}22` : corFundoZebra,
                color: corTexto,
                fontFamily: fonteCorpo.familia,
                fontSize: 24,
                padding: "9px 14px",
                borderRight: c < colunas.length - 1 ? `1px solid ${corTextoSecundario}20` : undefined,
                borderTop: `1px solid ${corTextoSecundario}20`,
                outline: destacar_coluna === c ? `2px solid ${corDestaque}` : undefined,
              }}
            >
              {celula}
            </div>
          ));
        })}
      </div>
    </AbsoluteFill>
  );
};

export { planilhaSchema, defaultProps } from "./schema";
