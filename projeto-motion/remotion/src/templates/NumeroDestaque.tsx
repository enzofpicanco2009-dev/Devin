import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  valor: z.string(),
  numero: z.number().nullable().default(null),
  prefixo: z.string().default(""),
  sufixo: z.string().default(""),
  decimais: z.number().int().default(0),
  rotulo: z.string().default(""),
  sentimento: z.enum(["positivo", "negativo", "neutro"]).default("neutro"),
  tamanhoFonte: z.number().default(220),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  valor: "13,75%",
  numero: 13.75,
  sufixo: "%",
  decimais: 2,
  rotulo: "taxa Selic hoje",
  duracaoEmSegundos: 4,
});

const fmt = (n: number, d: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

export const NumeroDestaque: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const esc = useEscala();
  const ent = useEntrada(0, p.spring, 25);
  const contagem = interpolate(frame, [0, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const cor =
    p.sentimento === "positivo"
      ? p.corPositivo
      : p.sentimento === "negativo"
        ? p.corNegativo
        : p.corDestaque;
  const texto =
    p.numero === null
      ? p.valor
      : `${p.prefixo}${fmt(p.numero * contagem, p.decimais)}${p.sufixo}`;
  return (
    <Cartao {...p}>
      <div
        style={{
          fontWeight: p.fonte.peso,
          fontSize: p.tamanhoFonte * esc,
          lineHeight: 1,
          color: cor,
          letterSpacing: "-0.04em",
          transform: `scale(${0.7 + 0.3 * ent})`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {texto}
      </div>
      {p.rotulo && (
        <Rotulo
          cor={p.corTextoSecundario}
          tamanho={44 * esc}
          fonte={p.fonteCorpo}
          style={{ marginTop: 30 * esc, opacity: ent }}
        >
          {p.rotulo}
        </Rotulo>
      )}
    </Cartao>
  );
};
