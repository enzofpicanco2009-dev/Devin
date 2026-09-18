import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { ajustarTexto } from "../lib/layoutTexto";
import { Cartao, useEscala } from "../lib/Cartao";
import { useJanela } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   texto      (obrigatório) -> resumo curto da ideia, em 1–2 frases (NÃO a fala bruta)
//   destaque   (opcional)    -> até 2 palavras do texto para colorir
// Fallback universal: quando nenhum outro template se encaixa.

// BLOCO 2 — design fixo do template (nunca vem da IA)
const CONFIG = {
  tamanhoMax: 60,
  tamanhoMin: 36,
  maxLinhas: 4,
  maxCaracteresLinha: 40,
  alturaLinha: 1.35,
  distanciaSubidaPx: 24,
  janelaEntrada: [0, 0.18] as const,
  larguraBarraPx: 6,
  alturaBarraPx: 120,
};

export const schema = baseSchema.extend({
  texto: z.string(),
  destaque: z.array(z.string()).default([]),
  tamanhoFonte: z.number().default(CONFIG.tamanhoMax),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  texto: "Quando a Selic sobe, o crédito fica mais caro e o consumo desacelera.",
  destaque: ["crédito"],
  duracaoEmSegundos: 5,
});

const normalizar = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const TextoCorrido: React.FC<Props> = (p) => {
  const esc = useEscala();
  const ent = useJanela(CONFIG.janelaEntrada[0], CONFIG.janelaEntrada[1], { maxS: 0.9 });
  const layout = ajustarTexto(p.texto, {
    tamanhoMax: p.tamanhoFonte,
    tamanhoMin: CONFIG.tamanhoMin,
    maxLinhas: CONFIG.maxLinhas,
    maxCaracteresLinha: CONFIG.maxCaracteresLinha,
  });
  const marcadas = new Set(p.destaque.map(normalizar));
  return (
    <Cartao {...p}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40 * esc,
          maxWidth: 1500 * esc,
          opacity: ent,
          transform: `translateY(${(1 - ent) * CONFIG.distanciaSubidaPx * esc}px)`,
        }}
      >
        <div
          style={{
            width: CONFIG.larguraBarraPx * esc,
            height: CONFIG.alturaBarraPx * esc * ent,
            borderRadius: 999,
            background: p.corDestaque,
            flex: "none",
          }}
        />
        <div
          style={{
            fontFamily: p.fonteCorpo.familia,
            fontWeight: 500,
            fontSize: layout.tamanhoFonte * esc,
            lineHeight: CONFIG.alturaLinha,
            color: p.corTexto,
            textAlign: "left",
          }}
        >
          {layout.linhas.map((l, i) => (
            <div key={i}>
              {l.split(" ").map((w, j) => (
                <span
                  key={j}
                  style={{
                    color: marcadas.has(normalizar(w)) ? p.corDestaque : undefined,
                    fontWeight: marcadas.has(normalizar(w)) ? 700 : undefined,
                  }}
                >
                  {w}{" "}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Cartao>
  );
};
