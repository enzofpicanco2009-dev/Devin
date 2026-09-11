import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { ajustarTexto } from "../lib/layoutTexto";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  texto: z.string(),
  autor: z.string().default(""),
  tamanhoFonte: z.number().default(64),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  texto: "Juros são o preço do tempo.",
  autor: "Economista anônimo",
  duracaoEmSegundos: 4,
});

export const Citacao: React.FC<Props> = (p) => {
  const esc = useEscala();
  const ent = useEntrada(0, p.spring, 22);
  const autor = useEntrada(14, p.spring, 18);
  const layout = ajustarTexto(p.texto, {
    tamanhoMax: p.tamanhoFonte,
    tamanhoMin: 40,
    maxLinhas: 4,
    maxCaracteresLinha: 34,
  });
  return (
    <Cartao {...p}>
      <div
        style={{
          fontSize: 260 * esc,
          lineHeight: 0.6,
          color: p.corDestaque,
          fontFamily: "Georgia, serif",
          opacity: ent * 0.9,
          height: 120 * esc,
        }}
      >
        “
      </div>
      <div
        style={{
          fontFamily: p.fonteCorpo.familia,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: layout.tamanhoFonte * esc,
          lineHeight: 1.25,
          textAlign: "center",
          opacity: ent,
          transform: `translateY(${(1 - ent) * 30 * esc}px)`,
        }}
      >
        {layout.linhas.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      {p.autor && (
        <Rotulo
          cor={p.corDestaque}
          tamanho={36 * esc}
          fonte={p.fonteCorpo}
          style={{ marginTop: 40 * esc, opacity: autor, letterSpacing: "0.08em" }}
        >
          — {p.autor.toUpperCase()}
        </Rotulo>
      )}
    </Cartao>
  );
};
