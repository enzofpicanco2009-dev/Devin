import React from "react";
import { AbsoluteFill, Img, Loop, OffthreadVideo, staticFile, useVideoConfig } from "remotion";

export type FundoOverride = {
  src: string;
  tipo: "imagem" | "video";
  brilho?: number;
  contraste?: number;
  saturacao?: number;
  desfoque_px?: number;
  opacidade?: number;
  escurecer?: number;
  zoom?: number;
  fit_mode?: "cover" | "contain" | "fill" | "fit";
  posicao_x?: number;
  posicao_y?: number;
  blend_mode?: "normal" | "multiply" | "screen" | "overlay";
  camadas?: FundoOverride[];
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const srcFinal = (src: string) => (src.startsWith("http") ? src : staticFile(src));

const renderCamada = (camada: FundoOverride, startFromFrame: number, durationInFrames: number, idx: number) => {
  const brilho = clamp(Number(camada.brilho ?? 1), 0.2, 2.5);
  const contraste = clamp(Number(camada.contraste ?? 1), 0.2, 2.5);
  const saturacao = clamp(Number(camada.saturacao ?? 1), 0, 3);
  const blur = camada.tipo === "video"
    ? clamp(Number(camada.desfoque_px ?? 0), 0, 2)
    : clamp(Number(camada.desfoque_px ?? 0), 0, 20);
  const opacidade = clamp(Number(camada.opacidade ?? 1), 0, 1);
  const escurecer = camada.tipo === "video"
    ? clamp(Number(camada.escurecer ?? 0), 0, 0.35)
    : clamp(Number(camada.escurecer ?? 0), 0, 0.95);
  const fitMode = camada.fit_mode || "cover";
  const zoomMax = fitMode === "fit" ? 1 : 3;
  const zoom = clamp(Number(camada.zoom ?? 1), 0.1, zoomMax);
  const objectFit = fitMode === "fit" ? "cover" : fitMode;
  const px = (fitMode === "fit" ? 0.5 : clamp(Number(camada.posicao_x ?? 0.5), 0, 1)) * 100;
  const py = (fitMode === "fit" ? 0.5 : clamp(Number(camada.posicao_y ?? 0.5), 0, 1)) * 100;
  const blend = camada.blend_mode || "normal";

  const precisaFiltro =
    Math.abs(brilho - 1) > 0.001 ||
    Math.abs(contraste - 1) > 0.001 ||
    Math.abs(saturacao - 1) > 0.001 ||
    blur > 0.001;

  const estiloMidia: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit,
    objectPosition: `${px}% ${py}%`,
    transform: `scale(${zoom})`,
    opacity: opacidade,
    mixBlendMode: blend,
    filter: precisaFiltro ? `brightness(${brilho}) contrast(${contraste}) saturate(${saturacao}) blur(${blur}px)` : undefined,
  };

  return (
    <React.Fragment key={`fundo-camada-${idx}`}>
      {camada.tipo === "video" ? (
        <Loop durationInFrames={durationInFrames}>
          <OffthreadVideo
            src={srcFinal(camada.src)}
            muted
            startFrom={Math.max(0, Math.round(startFromFrame))}
            style={estiloMidia}
          />
        </Loop>
      ) : (
        <Img src={srcFinal(camada.src)} style={estiloMidia} />
      )}
      {escurecer > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${escurecer})` }} />}
    </React.Fragment>
  );
};

export const FundoMidia: React.FC<{ fundo: FundoOverride; startFromFrame?: number }> = ({
  fundo,
  startFromFrame = 0,
}) => {
  const { durationInFrames } = useVideoConfig();
  const camadas = Array.isArray(fundo.camadas) && fundo.camadas.length ? fundo.camadas : [fundo];

  return (
    <AbsoluteFill>
      {camadas.map((camada, idx) => renderCamada(camada, startFromFrame, durationInFrames, idx))}
    </AbsoluteFill>
  );
};
