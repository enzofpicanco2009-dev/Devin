import React from "react";
import { useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";

const lado = z.object({ rotulo: z.string(), valor: z.string().default("") });

export const schema = baseSchema.extend({
  titulo: z.string().default(""),
  a: lado,
  b: lado,
  vencedor: z.enum(["a", "b", "nenhum"]).default("nenhum"),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  titulo: "Onde render mais?",
  a: { rotulo: "Poupança", valor: "6%" },
  b: { rotulo: "Tesouro", valor: "13%" },
  vencedor: "b",
  duracaoEmSegundos: 5,
});

const Lado: React.FC<{
  p: Props;
  qual: "a" | "b";
  delay: number;
}> = ({ p, qual, delay }) => {
  const esc = useEscala();
  const ent = useEntrada(delay, p.spring, 20);
  const dado = p[qual];
  const venceu = p.vencedor === qual;
  const perdeu = p.vencedor !== "nenhum" && !venceu;
  const cor = venceu ? p.corPositivo : perdeu ? p.corNegativo : p.corDestaque;
  return (
    <div
      style={{
        flex: 1,
        background: p.corFundoSecundario,
        border: `${4 * esc}px solid ${venceu ? cor : "transparent"}`,
        borderRadius: 32 * esc,
        padding: `${50 * esc}px ${30 * esc}px`,
        textAlign: "center",
        opacity: ent,
        transform: `translateX(${(1 - ent) * (qual === "a" ? -60 : 60) * esc}px)`,
      }}
    >
      <Rotulo cor={p.corTextoSecundario} tamanho={40 * esc} fonte={p.fonteCorpo}>
        {dado.rotulo}
      </Rotulo>
      {dado.valor && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: 120 * esc,
            color: cor,
            marginTop: 20 * esc,
            lineHeight: 1,
          }}
        >
          {dado.valor}
        </div>
      )}
    </div>
  );
};

export const ComparacaoDoisLados: React.FC<Props> = (p) => {
  const esc = useEscala();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const tit = useEntrada(0, p.spring, 18);
  return (
    <Cartao {...p}>
      {p.titulo && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: 64 * esc,
            marginBottom: 50 * esc,
            opacity: tit,
            textAlign: "center",
          }}
        >
          {p.titulo}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          gap: 40 * esc,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <Lado p={p} qual="a" delay={6} />
        <div
          style={{
            alignSelf: "center",
            fontWeight: 900,
            fontSize: 56 * esc,
            color: p.corTextoSecundario,
            opacity: tit,
          }}
        >
          VS
        </div>
        <Lado p={p} qual="b" delay={14} />
      </div>
    </Cartao>
  );
};
