import React from "react";
import { useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  titulo: z.string().default(""),
  itens: z.array(z.string()).min(1).max(6),
  temposS: z.array(z.number()).default([]),
  numerada: z.boolean().default(true),
  tamanhoFonte: z.number().default(56),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  titulo: "3 efeitos da Selic alta",
  itens: ["Crédito mais caro", "Menos consumo", "Inflação cai"],
  duracaoEmSegundos: 6,
});

const Item: React.FC<{ p: Props; i: number; delay: number }> = ({ p, i, delay }) => {
  const esc = useEscala();
  const ent = useEntrada(delay, p.spring, 18);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28 * esc,
        opacity: ent,
        transform: `translateX(${(1 - ent) * -40 * esc}px)`,
        marginBottom: 26 * esc,
      }}
    >
      <div
        style={{
          width: 64 * esc,
          height: 64 * esc,
          borderRadius: 999,
          background: p.corDestaque,
          color: p.corFundo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 32 * esc,
          flex: "none",
        }}
      >
        {p.numerada ? i + 1 : "•"}
      </div>
      <div
        style={{
          fontFamily: p.fonteCorpo.familia,
          fontWeight: 600,
          fontSize: p.tamanhoFonte * esc,
          lineHeight: 1.15,
        }}
      >
        {p.itens[i]}
      </div>
    </div>
  );
};

export const ListaAnimada: React.FC<Props> = (p) => {
  const esc = useEscala();
  const { fps } = useVideoConfig();
  const tit = useEntrada(0, p.spring, 18);
  const n = p.itens.length;
  const janela = Math.max(0.5, p.duracaoEmSegundos - 1.2);
  return (
    <Cartao {...p}>
      <div style={{ width: "100%", maxWidth: 1400 * esc }}>
        {p.titulo && (
          <div
            style={{
              fontWeight: p.fonte.peso,
              fontSize: 68 * esc,
              marginBottom: 48 * esc,
              opacity: tit,
              color: p.corTexto,
              lineHeight: 1.1,
            }}
          >
            {p.titulo}
          </div>
        )}
        {p.itens.map((_, i) => {
          const t = p.temposS[i] ?? 0.6 + (janela * i) / n;
          return <Item key={i} p={p} i={i} delay={Math.round(t * fps)} />;
        })}
      </div>
    </Cartao>
  );
};
