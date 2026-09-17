import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";
import { easeOutCubic } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   titulo  (opcional)     -> título curto acima da lista
//   itens   (obrigatório)  -> 2 a 6 strings curtas (≤ 6 palavras cada)
// O M12 pode ainda passar temposS (segundos em que o narrador fala cada item);
// sem isso os itens são revelados em sequência dentro da janela abaixo.

// BLOCO 2 — design fixo do template
const CONFIG = {
  tamanhoTitulo: 68,
  tamanhoItemPadrao: 56,
  espacoEntreItens: 26,
  marcadorPx: 64,
  distanciaSlidePx: 40,
  janelaItens: [0.15, 0.75] as const, // revelação sequencial (fração da cena)
  duracaoEntradaItemS: 0.35,
  janelaMaxS: 5,
};

export const schema = baseSchema.extend({
  titulo: z.string().default(""),
  itens: z.array(z.string()).min(1).max(6),
  temposS: z.array(z.number()).default([]),
  numerada: z.boolean().default(true),
  tamanhoFonte: z.number().default(CONFIG.tamanhoItemPadrao),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  titulo: "3 efeitos da Selic alta",
  itens: ["Crédito mais caro", "Menos consumo", "Inflação cai"],
  duracaoEmSegundos: 6,
});

/** Progresso de entrada do item i: por tempo falado (temposS) ou sequencial na janela. */
function useEntradaItem(p: Props, i: number): number {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const dur = durationInFrames / fps;
  const t = frame / fps;
  let inicio: number;
  if (p.temposS[i] !== undefined) {
    inicio = p.temposS[i];
  } else {
    const janela = Math.min(CONFIG.janelaMaxS, dur * (CONFIG.janelaItens[1] - CONFIG.janelaItens[0]));
    inicio = dur * CONFIG.janelaItens[0] + (janela * i) / p.itens.length;
  }
  const x = (t - inicio) / CONFIG.duracaoEntradaItemS;
  return easeOutCubic(Math.min(1, Math.max(0, x)));
}

const Item: React.FC<{ p: Props; i: number }> = ({ p, i }) => {
  const esc = useEscala();
  const ent = useEntradaItem(p, i);
  if (ent <= 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28 * esc,
        opacity: ent,
        transform: `translateX(${(1 - ent) * -CONFIG.distanciaSlidePx * esc}px)`,
        marginBottom: CONFIG.espacoEntreItens * esc,
      }}
    >
      <div
        style={{
          width: CONFIG.marcadorPx * esc,
          height: CONFIG.marcadorPx * esc,
          borderRadius: 999,
          background: p.corDestaque,
          color: p.corFundo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 32 * esc,
          flex: "none",
          transform: `scale(${0.6 + 0.4 * ent})`,
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
  const tit = useEntrada(0, p.spring, 18);
  return (
    <Cartao {...p}>
      <div style={{ width: "100%", maxWidth: 1400 * esc }}>
        {p.titulo && (
          <div
            style={{
              fontWeight: p.fonte.peso,
              fontSize: CONFIG.tamanhoTitulo * esc,
              marginBottom: 48 * esc,
              opacity: tit,
              transform: `translateY(${(1 - tit) * -16 * esc}px)`,
              color: p.corTexto,
              lineHeight: 1.1,
            }}
          >
            {p.titulo}
          </div>
        )}
        {p.itens.map((_, i) => (
          <Item key={i} p={p} i={i} />
        ))}
      </div>
    </Cartao>
  );
};
