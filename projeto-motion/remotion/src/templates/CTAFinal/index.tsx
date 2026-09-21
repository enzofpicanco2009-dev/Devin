import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CTAFinalProps } from "./schema";

export const CTAFinal: React.FC<CTAFinalProps> = ({
  texto_principal,
  subtexto,
  mostrar_logo,
  estilo_botao,
  logo_src,
  corFundo,
  corTexto,
  corTextoSecundario,
  corDestaque,
  fonte,
  fonteCorpo,
  spring: springCfg,
  safeArea,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const temLogo = mostrar_logo && !!logo_src;
  const logoOpacity = temLogo
    ? interpolate(frame, [0, fps * 0.4], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 0;
  const logoDelay = temLogo ? fps * 0.3 : 0;

  const textoSpring = spring({
    frame: Math.max(0, frame - logoDelay),
    fps,
    config: springCfg,
  });
  const textoOpacity = interpolate(textoSpring, [0, 1], [0, 1]);
  const textoTranslateY = interpolate(textoSpring, [0, 1], [20, 0]);

  const delaySubtexto = logoDelay + fps * 0.15;
  const subtextoOpacity = interpolate(
    frame,
    [delaySubtexto, delaySubtexto + fps * 0.3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const pulseFrame = Math.max(0, frame - delaySubtexto - fps * 0.3);
  const pulseScale = 1 + Math.sin((pulseFrame / fps) * Math.PI * 1.2) * 0.03;

  const botaoStyle: React.CSSProperties =
    estilo_botao === "solido"
      ? {
          backgroundColor: corDestaque,
          color: corFundo,
          border: `2px solid ${corDestaque}`,
        }
      : {
          backgroundColor: "transparent",
          color: corDestaque,
          border: `2px solid ${corDestaque}`,
        };

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
      {temLogo && logo_src && (
        <Img
          src={logo_src}
          style={{
            width: 96,
            height: 96,
            objectFit: "contain",
            opacity: logoOpacity,
            marginBottom: 28,
          }}
        />
      )}

      <div
        style={{
          opacity: textoOpacity,
          transform: `translateY(${textoTranslateY}px)`,
          fontFamily: fonte.familia,
          fontSize: 78,
          color: corTexto,
          textAlign: "center",
          fontWeight: fonte.peso,
          marginBottom: 20,
        }}
      >
        {texto_principal}
      </div>

      {subtexto && (
        <div
          style={{
            opacity: subtextoOpacity,
            fontFamily: fonteCorpo.familia,
            fontSize: 44,
            color: corTextoSecundario,
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          {subtexto}
        </div>
      )}

      <div
        style={{
          ...botaoStyle,
          padding: "14px 40px",
          borderRadius: 10,
          fontFamily: fonteCorpo.familia,
          fontSize: 38,
          fontWeight: 700,
          opacity: subtextoOpacity,
          transform: `scale(${pulseScale})`,
        }}
      >
        {texto_principal}
      </div>
    </AbsoluteFill>
  );
};

export { ctaFinalSchema, defaultProps } from "./schema";
