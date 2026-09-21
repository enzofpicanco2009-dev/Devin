import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TimelineProps } from "./schema";

export const Timeline: React.FC<TimelineProps> = ({
  titulo,
  eventos,
  orientacao,
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

  const isHorizontal = orientacao === "horizontal";
  const n = eventos.length;

  const framesTotais = fps * 1.2 * n;
  const progressoLinha = interpolate(frame, [0, framesTotais], [0, 1], {
    extrapolateRight: "clamp",
  });

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
            fontSize: 52,
            color: corTexto,
            marginBottom: 28,
          }}
        >
          {titulo}
        </div>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          alignItems: "flex-start",
          width: isHorizontal ? "85%" : "auto",
          height: isHorizontal ? "auto" : "70%",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            backgroundColor: `${corTextoSecundario}40`,
            ...(isHorizontal
              ? { top: 10, left: 0, right: 0, height: 3 }
              : { left: 10, top: 0, bottom: 0, width: 3 }),
          }}
        />

        <div
          style={{
            position: "absolute",
            backgroundColor: corTextoSecundario,
            ...(isHorizontal
              ? { top: 10, left: 0, height: 3, width: `${progressoLinha * 100}%` }
              : { left: 10, top: 0, width: 3, height: `${progressoLinha * 100}%` }),
          }}
        />

        {eventos.map((evento, i) => {
          const inicioEvento = (i / n) * framesTotais;
          const opacityNo = interpolate(
            frame,
            [inicioEvento, inicioEvento + fps * 0.3],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          const scaleNo = interpolate(
            frame,
            [inicioEvento, inicioEvento + fps * 0.3],
            [0.4, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );

          return (
            <div
              key={i}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: isHorizontal ? "column" : "row",
                alignItems: "center",
                flex: isHorizontal ? 1 : undefined,
                marginBottom: isHorizontal ? 0 : 18,
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: corDestaque,
                  opacity: opacityNo,
                  transform: `scale(${scaleNo})`,
                  marginBottom: isHorizontal ? 12 : 0,
                  marginRight: isHorizontal ? 0 : 16,
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  opacity: opacityNo,
                  textAlign: isHorizontal ? "center" : "left",
                }}
              >
                <div
                  style={{
                    fontFamily: fonte.familia,
                    fontSize: 30,
                    color: corTexto,
                    fontWeight: 700,
                  }}
                >
                  {evento.marcador}
                </div>
                <div
                  style={{
                    fontFamily: fonteCorpo.familia,
                    fontSize: 26,
                    color: corTextoSecundario,
                    maxWidth: isHorizontal ? 160 : 280,
                  }}
                >
                  {evento.descricao}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export { timelineSchema, defaultProps } from "./schema";
