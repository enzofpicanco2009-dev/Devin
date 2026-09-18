import React from "react";
import { useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";
import { easeOutCubic, useJanela } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   titulo    (opcional)    -> título curto acima das colunas
//   a, b      (obrigatório) -> {rotulo, valor?, itens?}  valor = número/frase curta em destaque;
//                              itens = até 4 pontos curtos (para comparações qualitativas)
//   vencedor  (opcional)    -> "a" | "b" | "nenhum"

// BLOCO 2 — design fixo do template
const CONFIG = {
  tamanhoTitulo: 64,
  tamanhoRotulo: 40,
  tamanhoValor: 120,
  tamanhoValorVertical: 96,
  tamanhoItem: 36,
  alturaLinhaItem: 1.3,
  raioCartao: 32,
  paddingCartao: [50, 36] as const,
  distanciaSlidePx: 80,
  janelaEntradaA: [0.05, 0.3] as const,
  janelaEntradaB: [0.18, 0.43] as const,
  janelaItens: [0.3, 0.75] as const,
  entradaMaxS: 1.0,
  divisorEspessura: 3,
};

const lado = z.object({
  rotulo: z.string(),
  valor: z.string().default(""),
  itens: z.array(z.string()).max(4).default([]),
});

export const schema = baseSchema.extend({
  titulo: z.string().default(""),
  a: lado,
  b: lado,
  vencedor: z.enum(["a", "b", "nenhum"]).default("nenhum"),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  titulo: "Onde render mais?",
  a: { rotulo: "Poupança", valor: "6%", itens: ["Liquidez diária", "Isenta de IR"] },
  b: { rotulo: "Tesouro", valor: "13%", itens: ["Rende mais", "Tem IR"] },
  vencedor: "b",
  duracaoEmSegundos: 5,
});

const Lado: React.FC<{ p: Props; qual: "a" | "b"; vertical: boolean }> = ({ p, qual, vertical }) => {
  const esc = useEscala();
  const janela = qual === "a" ? CONFIG.janelaEntradaA : CONFIG.janelaEntradaB;
  const ent = useJanela(janela[0], janela[1], { maxS: CONFIG.entradaMaxS });
  const itensProg = useJanela(CONFIG.janelaItens[0], CONFIG.janelaItens[1], { easing: (t) => t });
  const dado = p[qual];
  const venceu = p.vencedor === qual;
  const perdeu = p.vencedor !== "nenhum" && !venceu;
  const corBase = qual === "a" ? p.corDestaque : p.corDestaque2;
  const cor = venceu ? p.corPositivo : perdeu ? p.corNegativo : corBase;
  const direcao = vertical ? 0 : qual === "a" ? -1 : 1;
  const direcaoY = vertical ? (qual === "a" ? -1 : 1) : 0;
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: p.corFundoSecundario,
        border: `${4 * esc}px solid ${venceu ? cor : `${corBase}55`}`,
        borderRadius: CONFIG.raioCartao * esc,
        padding: `${CONFIG.paddingCartao[0] * esc}px ${CONFIG.paddingCartao[1] * esc}px`,
        textAlign: "center",
        opacity: ent * (perdeu ? 0.75 : 1),
        transform: `translate(${(1 - ent) * direcao * CONFIG.distanciaSlidePx * esc}px, ${(1 - ent) * direcaoY * CONFIG.distanciaSlidePx * esc}px)`,
        boxShadow: venceu ? `0 0 ${50 * esc}px ${cor}44` : undefined,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: `${8 * esc}px ${22 * esc}px`,
          borderRadius: 999,
          background: `${cor}22`,
          marginBottom: 10 * esc,
        }}
      >
        <Rotulo cor={cor} tamanho={CONFIG.tamanhoRotulo * esc} fonte={p.fonteCorpo}>
          {dado.rotulo}
        </Rotulo>
      </div>
      {dado.valor && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: (vertical ? CONFIG.tamanhoValorVertical : CONFIG.tamanhoValor) * esc,
            color: cor,
            marginTop: 14 * esc,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {dado.valor}
        </div>
      )}
      {dado.itens.length > 0 && (
        <div style={{ marginTop: 28 * esc, textAlign: "left", display: "inline-block" }}>
          {dado.itens.map((it, i) => {
            const x = Math.min(1, Math.max(0, itensProg * dado.itens.length - i));
            const e = easeOutCubic(x);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 16 * esc,
                  alignItems: "baseline",
                  fontFamily: p.fonteCorpo.familia,
                  fontSize: CONFIG.tamanhoItem * esc,
                  lineHeight: CONFIG.alturaLinhaItem,
                  color: p.corTexto,
                  opacity: e,
                  transform: `translateX(${(1 - e) * 18 * esc}px)`,
                }}
              >
                <span style={{ color: cor, fontWeight: 800 }}>•</span>
                <span>{it}</span>
              </div>
            );
          })}
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
  const div = useJanela(0.15, 0.4, { maxS: 0.8 });
  return (
    <Cartao {...p}>
      {p.titulo && (
        <div
          style={{
            fontWeight: p.fonte.peso,
            fontSize: CONFIG.tamanhoTitulo * esc,
            marginBottom: 50 * esc,
            opacity: tit,
            transform: `translateY(${(1 - tit) * -14 * esc}px)`,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {p.titulo}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          gap: 36 * esc,
          width: "100%",
          alignItems: "stretch",
        }}
      >
        <Lado p={p} qual="a" vertical={vertical} />
        <div
          style={{
            alignSelf: "center",
            display: "flex",
            flexDirection: vertical ? "row" : "column",
            alignItems: "center",
            gap: 14 * esc,
            opacity: div,
          }}
        >
          <div
            style={{
              width: vertical ? 120 * esc * div : CONFIG.divisorEspessura * esc,
              height: vertical ? CONFIG.divisorEspessura * esc : 120 * esc * div,
              background: p.corTextoSecundario,
              opacity: 0.5,
              borderRadius: 999,
            }}
          />
          <div style={{ fontWeight: 900, fontSize: 48 * esc, color: p.corTextoSecundario }}>VS</div>
          <div
            style={{
              width: vertical ? 120 * esc * div : CONFIG.divisorEspessura * esc,
              height: vertical ? CONFIG.divisorEspessura * esc : 120 * esc * div,
              background: p.corTextoSecundario,
              opacity: 0.5,
              borderRadius: 999,
            }}
          />
        </div>
        <Lado p={p} qual="b" vertical={vertical} />
      </div>
    </Cartao>
  );
};
