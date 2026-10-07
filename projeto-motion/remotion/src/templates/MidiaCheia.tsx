import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";

/**
 * Só a mídia (imagem ou vídeo) em tela cheia, sem texto; fade de entrada e saída.
 * Imagens ganham um zoom lento (in ou out) a partir do centro; a escala nunca fica
 * abaixo de 1, então a imagem continua cobrindo o quadro inteiro.
 */
export const schema = baseSchema.extend({
  src: z.string(),
  tipo: z.enum(["imagem", "video"]).default("imagem"),
  ajusteImagem: z.enum(["cover", "contain"]).default("contain"),
  zoom: z.enum(["in", "out", "nenhum"]).default("in"),
  zoomMax: z.number().min(1).max(1.3).default(1.08),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  src: "exemplo/placeholder.png",
  duracaoEmSegundos: 4,
});

const resolver = (src: string) =>
  /^(https?:|data:|\/)/.test(src) ? src : staticFile(src);

export const MidiaCheia: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const escalaTela = Math.min(width, height) / 1080;
  const saidaFramesRapida = Math.max(1, Math.round(p.saidaFrames * 0.45));
  const inicioSaida = Math.max(0, durationInFrames - saidaFramesRapida);
  const isContain = p.tipo === "imagem" && p.ajusteImagem === "contain";
  const ampEntrada = (isContain ? 42 : 180) * escalaTela;
  const ampSaida = (isContain ? 56 : 220) * escalaTela;
  const opIn = interpolate(frame, [0, p.entradaFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opOut = interpolate(
    frame,
    [inicioSaida, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );
  const progEntrada = interpolate(frame, [0, p.entradaFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const progSaida = interpolate(frame, [inicioSaida, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  let deslocamentoY = 0;
  if (p.animacaoEntrada === "de_baixo") deslocamentoY += (1 - progEntrada) * ampEntrada;
  if (p.animacaoEntrada === "de_cima") deslocamentoY -= (1 - progEntrada) * ampEntrada;
  if (p.animacaoSaida === "para_cima") deslocamentoY -= progSaida * ampSaida;
  if (p.animacaoSaida === "para_baixo") deslocamentoY += progSaida * ampSaida;
  const progresso = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const escala =
    p.zoom === "nenhum"
      ? 1
      : p.zoom === "in"
        ? 1 + (p.zoomMax - 1) * progresso
        : p.zoomMax - (p.zoomMax - 1) * progresso;
  const estilo: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: p.tipo === "imagem" ? p.ajusteImagem : "cover",
  };
  const estiloMidia: React.CSSProperties = {
    ...estilo,
    transform: `translateY(${deslocamentoY}px) scale(${escala})`,
    transformOrigin: "center center",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          opacity: Math.min(opIn, opOut),
          overflow: "hidden",
        }}
      >
        {p.tipo === "video" ? (
          <OffthreadVideo src={resolver(p.src)} muted style={estiloMidia} />
        ) : (
          <Img src={resolver(p.src)} style={estiloMidia} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
