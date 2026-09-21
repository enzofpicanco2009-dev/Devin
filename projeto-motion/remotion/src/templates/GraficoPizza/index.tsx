import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { GraficoPizzaProps } from "./schema";

const RAIO_EXTERNO = 140;
const RAIO_DONUT_INTERNO = 0.55;
const CENTRO_X = 250;
const CENTRO_Y = 200;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function fatiaPath(
  cx: number,
  cy: number,
  raioExterno: number,
  raioInterno: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  const p1 = polarToCartesian(cx, cy, raioExterno, endAngle);
  const p2 = polarToCartesian(cx, cy, raioExterno, startAngle);

  if (raioInterno <= 0) {
    return `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${raioExterno} ${raioExterno} 0 ${largeArc} 0 ${p2.x} ${p2.y} Z`;
  }

  const p3 = polarToCartesian(cx, cy, raioInterno, startAngle);
  const p4 = polarToCartesian(cx, cy, raioInterno, endAngle);
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${raioExterno} ${raioExterno} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${raioInterno} ${raioInterno} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * percent);
  let b = (num & 0x0000ff) + Math.round(255 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const GraficoPizza: React.FC<GraficoPizzaProps> = ({
  titulo,
  fatias,
  estilo,
  destacar_indice,
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

  const total = fatias.reduce((soma, f) => soma + f.valor, 0);
  const raioInterno = estilo === "donut" ? RAIO_EXTERNO * RAIO_DONUT_INTERNO : 0;

  const framesPorFatia = fps * 0.5;
  let anguloAcumulado = 0;

  const fatiasComAngulo = fatias.map((fatia, i) => {
    const anguloTotal = (fatia.valor / total) * 360;
    const inicioFrame = i * framesPorFatia;
    const progresso = interpolate(frame, [inicioFrame, inicioFrame + framesPorFatia], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const startAngle = anguloAcumulado;
    const endAngle = anguloAcumulado + anguloTotal * progresso;
    anguloAcumulado += anguloTotal;

    const percentual = ((fatia.valor / total) * 100).toFixed(0);
    const destacada = destacar_indice === i;

    const cor = destacada
      ? corDestaque
      : shadeColor(corTextoSecundario, (i / Math.max(1, fatias.length - 1)) * 0.4 - 0.1);

    return { ...fatia, startAngle, endAngle, percentual, cor, destacada, progresso };
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: corFundo,
        alignItems: "center",
        justifyContent: "center",
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
            fontSize: 56,
            color: corTexto,
            marginBottom: 24,
          }}
        >
          {titulo}
        </div>
      )}

      <svg viewBox="0 0 500 400" width={500} height={400}>
        {fatiasComAngulo.map((fatia, i) => {
          const deslocamento = fatia.destacada ? 12 : 0;
          const anguloMedio = (fatia.startAngle + fatia.endAngle) / 2;
          const offset = polarToCartesian(0, 0, deslocamento, anguloMedio);

          return (
            <g key={i} transform={`translate(${offset.x}, ${offset.y})`}>
              <path
                d={fatiaPath(
                  CENTRO_X,
                  CENTRO_Y,
                  RAIO_EXTERNO,
                  raioInterno,
                  fatia.startAngle,
                  fatia.endAngle,
                )}
                fill={fatia.cor}
                stroke={corFundo}
                strokeWidth={2}
              />
            </g>
          );
        })}

        {fatiasComAngulo.map((fatia, i) => {
          const anguloMedio = (fatia.startAngle + fatia.endAngle) / 2;
          const pontoNaFatia = polarToCartesian(CENTRO_X, CENTRO_Y, RAIO_EXTERNO, anguloMedio);
          const pontoRotulo = polarToCartesian(CENTRO_X, CENTRO_Y, RAIO_EXTERNO + 40, anguloMedio);
          const rotuloOpacity = interpolate(fatia.progresso, [0.7, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={`label-${i}`} opacity={rotuloOpacity}>
              <line
                x1={pontoNaFatia.x}
                y1={pontoNaFatia.y}
                x2={pontoRotulo.x}
                y2={pontoRotulo.y}
                stroke={corTextoSecundario}
                strokeWidth={1}
              />
              <text
                x={pontoRotulo.x}
                y={pontoRotulo.y}
                fill={corTexto}
                fontSize={14}
                fontFamily={fonteCorpo.familia}
                textAnchor={pontoRotulo.x > CENTRO_X ? "start" : "end"}
              >
                {fatia.rotulo} ({fatia.percentual}%)
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export { graficoPizzaSchema, defaultProps } from "./schema";
