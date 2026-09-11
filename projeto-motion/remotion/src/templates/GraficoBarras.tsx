import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  titulo: z.string().default(""),
  barras: z
    .array(z.object({ rotulo: z.string(), valor: z.number() }))
    .min(2)
    .max(6),
  unidade: z.string().default(""),
  destacarMaior: z.boolean().default(true),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  titulo: "Selic por ano",
  barras: [
    { rotulo: "2020", valor: 2 },
    { rotulo: "2021", valor: 9.25 },
    { rotulo: "2022", valor: 13.75 },
    { rotulo: "2023", valor: 11.75 },
  ],
  unidade: "%",
  duracaoEmSegundos: 6,
});

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const Barra: React.FC<{ p: Props; i: number; max: number }> = ({ p, i, max }) => {
  const esc = useEscala();
  const ent = useEntrada(8 + i * 8, p.spring, 30);
  const b = p.barras[i];
  const h = (Math.abs(b.valor) / max) * ent;
  const maior = p.destacarMaior && b.valor === max;
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100%",
        gap: 16 * esc,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 40 * esc,
          color: maior ? p.corDestaque : p.corTexto,
          opacity: ent,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fmt(b.valor * ent)}
        {p.unidade}
      </div>
      <div
        style={{
          width: "70%",
          height: `${h * 100}%`,
          minHeight: 6 * esc,
          background: maior ? p.corDestaque : p.corDestaque2,
          borderRadius: `${14 * esc}px ${14 * esc}px 4px 4px`,
        }}
      />
      <div
        style={{
          fontFamily: p.fonteCorpo.familia,
          fontSize: 34 * esc,
          color: p.corTextoSecundario,
          textAlign: "center",
        }}
      >
        {b.rotulo}
      </div>
    </div>
  );
};

export const GraficoBarras: React.FC<Props> = (p) => {
  const esc = useEscala();
  const tit = useEntrada(0, p.spring, 18);
  const max = Math.max(...p.barras.map((b) => Math.abs(b.valor)), 0.0001);
  return (
    <Cartao {...p}>
      {p.titulo && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: 60 * esc,
            marginBottom: 40 * esc,
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
          gap: 24 * esc,
          width: "100%",
          maxWidth: 1500 * esc,
          height: 560 * esc,
          borderBottom: `${3 * esc}px solid ${p.corTextoSecundario}`,
          paddingBottom: 12 * esc,
          alignItems: "flex-end",
        }}
      >
        {p.barras.map((_, i) => (
          <Barra key={i} p={p} i={i} max={max} />
        ))}
      </div>
    </Cartao>
  );
};
