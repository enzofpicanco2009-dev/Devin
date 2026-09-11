import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  src: z.string(),
  texto: z.string().default(""),
  legenda: z.string().default(""),
  zoom: z.number().default(1.12),
  focoX: z.number().min(0).max(1).default(0.5),
  focoY: z.number().min(0).max(1).default(0.5),
  moldura: z.boolean().default(true),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  src: "exemplo/placeholder.png",
  texto: "Banco Central",
  duracaoEmSegundos: 4,
});

const resolver = (src: string) =>
  /^(https?:|data:|\/)/.test(src) ? src : staticFile(src);

export const ImagemDestaque: React.FC<Props> = (p) => {
  const esc = useEscala();
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const vertical = height > width;
  const kb = interpolate(frame, [0, durationInFrames], [1, p.zoom]);
  const txt = useEntrada(10, p.spring, 20);
  const temTexto = Boolean(p.texto);
  return (
    <Cartao {...p}>
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          gap: 60 * esc,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: temTexto ? (vertical ? "0 0 55%" : "0 0 58%") : 1,
            width: temTexto ? undefined : "100%",
            height: temTexto && !vertical ? "80%" : temTexto ? undefined : "100%",
            borderRadius: p.moldura ? 32 * esc : 0,
            overflow: "hidden",
            boxShadow: p.moldura ? `0 ${30 * esc}px ${80 * esc}px rgba(0,0,0,.45)` : undefined,
            background: p.corFundoSecundario,
          }}
        >
          <Img
            src={resolver(p.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${p.focoX * 100}% ${p.focoY * 100}%`,
              transform: `scale(${kb})`,
              transformOrigin: `${p.focoX * 100}% ${p.focoY * 100}%`,
              display: "block",
            }}
          />
        </div>
        {temTexto && (
          <div
            style={{
              flex: 1,
              textAlign: vertical ? "center" : "left",
              opacity: txt,
              transform: `translateY(${(1 - txt) * 30 * esc}px)`,
            }}
          >
            <div style={{ fontWeight: p.fonte.peso, fontSize: 72 * esc, lineHeight: 1.1 }}>
              {p.texto}
            </div>
            {p.legenda && (
              <div
                style={{
                  fontFamily: p.fonteCorpo.familia,
                  fontSize: 38 * esc,
                  color: p.corTextoSecundario,
                  marginTop: 24 * esc,
                  lineHeight: 1.3,
                }}
              >
                {p.legenda}
              </div>
            )}
          </div>
        )}
      </div>
    </Cartao>
  );
};
