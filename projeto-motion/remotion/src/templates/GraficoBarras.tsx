import React from "react";
import { useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";
import { useJanela } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   titulo   (opcional)    -> título curto do gráfico
//   barras   (obrigatório) -> 2 a 6 itens {rotulo, valor}; valores como o narrador diz
//   unidade  (opcional)    -> "%", "mil", "R$"…

// BLOCO 2 — design fixo do template
const CONFIG = {
  tamanhoTitulo: 60,
  tamanhoValor: 42,
  tamanhoRotulo: 34,
  larguraBarra: 0.68, // fração da coluna
  janelaCrescimento: [0.08, 0.7] as const,
  janelaMaxS: 3.5,
  atrasoEntreBarrasS: 0.12,
  alturaGrafico: 560,
  alturaGraficoVertical: 720,
  linhasGuia: 3,
};

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

const Barra: React.FC<{ p: Props; i: number; max: number; cresc: number }> = ({
  p,
  i,
  max,
  cresc,
}) => {
  const esc = useEscala();
  const { fps, durationInFrames } = useVideoConfig();
  const dur = durationInFrames / fps;
  // cada barra começa um pouco depois da anterior, dentro do mesmo progresso global
  const janelaS = Math.min(CONFIG.janelaMaxS, dur * (CONFIG.janelaCrescimento[1] - CONFIG.janelaCrescimento[0]));
  const atraso = Math.min(0.6, (CONFIG.atrasoEntreBarrasS * i) / Math.max(0.1, janelaS));
  const ent = Math.min(1, Math.max(0, (cresc - atraso) / (1 - atraso)));
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
        gap: 14 * esc,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: CONFIG.tamanhoValor * esc,
          color: maior ? p.corDestaque : p.corTexto,
          opacity: ent,
          fontVariantNumeric: "tabular-nums",
          transform: `translateY(${(1 - ent) * 10 * esc}px)`,
        }}
      >
        {fmt(b.valor * ent)}
        {p.unidade}
      </div>
      <div
        style={{
          width: `${CONFIG.larguraBarra * 100}%`,
          height: `${h * 100}%`,
          minHeight: 6 * esc,
          background: maior
            ? p.corDestaque
            : `linear-gradient(180deg, ${p.corDestaque2}, ${p.corDestaque2}AA)`,
          borderRadius: `${14 * esc}px ${14 * esc}px 4px 4px`,
          boxShadow: maior ? `0 0 ${40 * esc}px ${p.corDestaque}55` : undefined,
        }}
      />
    </div>
  );
};

export const GraficoBarras: React.FC<Props> = (p) => {
  const esc = useEscala();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const tit = useEntrada(0, p.spring, 18);
  const cresc = useJanela(CONFIG.janelaCrescimento[0], CONFIG.janelaCrescimento[1], {
    maxS: CONFIG.janelaMaxS,
  });
  const max = Math.max(...p.barras.map((b) => Math.abs(b.valor)), 0.0001);
  const alt = (vertical ? CONFIG.alturaGraficoVertical : CONFIG.alturaGrafico) * esc;
  return (
    <Cartao {...p}>
      {p.titulo && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: CONFIG.tamanhoTitulo * esc,
            marginBottom: 44 * esc,
            opacity: tit,
            transform: `translateY(${(1 - tit) * -14 * esc}px)`,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {p.titulo}
        </div>
      )}
      <div style={{ width: "100%", maxWidth: 1500 * esc }}>
        <div style={{ position: "relative", height: alt }}>
          {Array.from({ length: CONFIG.linhasGuia }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${((i + 1) / (CONFIG.linhasGuia + 1)) * 100}%`,
                borderTop: `${1.5 * esc}px dashed ${p.corTextoSecundario}33`,
                opacity: tit,
              }}
            />
          ))}
          <div
            style={{
              display: "flex",
              gap: 24 * esc,
              height: "100%",
              alignItems: "flex-end",
              position: "relative",
            }}
          >
            {p.barras.map((_, i) => (
              <Barra key={i} p={p} i={i} max={max} cresc={cresc} />
            ))}
          </div>
        </div>
        <div
          style={{
            borderTop: `${3 * esc}px solid ${p.corTextoSecundario}`,
            marginTop: 10 * esc,
            paddingTop: 16 * esc,
            display: "flex",
            gap: 24 * esc,
            opacity: tit,
          }}
        >
          {p.barras.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: p.fonteCorpo.familia,
                fontSize: CONFIG.tamanhoRotulo * esc,
                color: p.corTextoSecundario,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {b.rotulo}
            </div>
          ))}
        </div>
      </div>
    </Cartao>
  );
};
