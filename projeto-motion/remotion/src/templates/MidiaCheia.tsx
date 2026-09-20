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

/** Só a mídia (imagem ou vídeo) em tela cheia, sem texto; fade de entrada e saída. */
export const schema = baseSchema.extend({
  src: z.string(),
  tipo: z.enum(["imagem", "video"]).default("imagem"),
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
  const estilo: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: p.corFundo }}>
      <AbsoluteFill style={{ opacity: Math.min(opIn, opOut) }}>
        {p.tipo === "video" ? (
          <Video src={resolver(p.src)} muted loop style={estilo} />
        ) : (
          <Img src={resolver(p.src)} style={estilo} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
