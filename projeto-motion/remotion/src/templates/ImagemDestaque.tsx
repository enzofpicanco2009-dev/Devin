import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  src: z.string(),
  texto: z.string().default(""),
  legenda: z.string().default(""),
  zoom: z.number().default(1),
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
  const { width, height, durationInFrames } = useVideoConfig();
  const vertical = height > width;
  const txt = useEntrada(10, p.spring, 20);
  const entBloco = useEntrada(0, p.spring, 20);
  const deBaixo = p.animacaoEntrada === "de_baixo";
  const deCima = p.animacaoEntrada === "de_cima";
  const saidaRapida = Math.max(1, Math.round(p.saidaFrames * 0.45));
  const progSaida = interpolate(
    frame,
    [Math.max(0, durationInFrames - saidaRapida), durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const deslocSaida =
    p.animacaoSaida === "para_cima"
      ? -progSaida * 200 * esc
      : p.animacaoSaida === "para_baixo"
        ? progSaida * 200 * esc
        : 0;
  const temTexto = Boolean(p.texto);
  return (
    <Cartao {...p} corFundo="transparent">
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
            background: "transparent",
            opacity: entBloco,
            transform: deBaixo
              ? `translateY(${(1 - entBloco) * 150 * esc + deslocSaida}px)`
              : deCima
                ? `translateY(${(1 - entBloco) * -150 * esc + deslocSaida}px)`
                : `translateY(${deslocSaida}px) scale(${0.92 + 0.08 * entBloco})`,
          }}
        >
          <Img
            src={resolver(p.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: `${p.focoX * 100}% ${p.focoY * 100}%`,
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
              transform: deBaixo
                ? `translateY(${(1 - txt) * 130 * esc + deslocSaida}px)`
                : deCima
                  ? `translateY(${(1 - txt) * -130 * esc + deslocSaida}px)`
                  : `translateY(${deslocSaida}px)`,
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
