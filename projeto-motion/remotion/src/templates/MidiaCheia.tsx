import React from "react";
import {
  AbsoluteFill,
  Img,
  Video,
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
    objectFit: "cover",
  };
  const estiloImagem: React.CSSProperties = {
    ...estilo,
    transform: `scale(${escala})`,
    transformOrigin: "center center",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: p.corFundo }}>
      <AbsoluteFill style={{ opacity: Math.min(opIn, opOut), overflow: "hidden" }}>
        {p.tipo === "video" ? (
          <Video src={resolver(p.src)} muted loop style={estilo} />
        ) : (
          <Img src={resolver(p.src)} style={estiloImagem} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
