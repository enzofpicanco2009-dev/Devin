import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { ajustarTexto } from "../lib/layoutTexto";
import { Cartao, Rotulo, useEscala } from "../lib/Cartao";
import { useJanela } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   texto  (obrigatório) -> a frase citada (≤ 30 palavras)
//   autor  (opcional)    -> quem disse

// BLOCO 2 — design fixo do template
const CONFIG = {
  tamanhoPadrao: 64,
  tamanhoMin: 38,
  maxLinhas: 4,
  maxCaracteresLinha: 36,
  tamanhoAutor: 34,
  aspasPx: 220,
  barraLarguraPx: 12,
  janelaEntrada: [0, 0.25] as const,
  janelaAutor: [0.18, 0.4] as const,
  entradaMaxS: 1.0,
  distanciaSubidaPx: 20,
};

export const schema = baseSchema.extend({
  texto: z.string(),
  autor: z.string().default(""),
  tamanhoFonte: z.number().default(CONFIG.tamanhoPadrao),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  texto: "Juros são o preço do tempo.",
  autor: "Economista anônimo",
  duracaoEmSegundos: 4,
});

export const Citacao: React.FC<Props> = (p) => {
  const esc = useEscala();
  const ent = useJanela(CONFIG.janelaEntrada[0], CONFIG.janelaEntrada[1], { maxS: CONFIG.entradaMaxS });
  const aut = useJanela(CONFIG.janelaAutor[0], CONFIG.janelaAutor[1], { maxS: CONFIG.entradaMaxS });
  const layout = ajustarTexto(p.texto, {
    tamanhoMax: p.tamanhoFonte,
    tamanhoMin: CONFIG.tamanhoMin,
    maxLinhas: CONFIG.maxLinhas,
    maxCaracteresLinha: CONFIG.maxCaracteresLinha,
  });
  return (
    <Cartao {...p}>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 44 * esc,
          maxWidth: 1500 * esc,
          opacity: ent,
          transform: `translateY(${(1 - ent) * CONFIG.distanciaSubidaPx * esc}px)`,
        }}
      >
        <div
          style={{
            width: CONFIG.barraLarguraPx * esc,
            borderRadius: 999,
            background: p.corDestaque,
            flex: "none",
            transform: `scaleY(${ent})`,
            transformOrigin: "top",
          }}
        />
        <div style={{ position: "relative", paddingTop: 30 * esc }}>
          <div
            style={{
              position: "absolute",
              top: -70 * esc,
              left: -10 * esc,
              fontSize: CONFIG.aspasPx * esc,
              lineHeight: 1,
              color: p.corDestaque,
              fontFamily: "Georgia, serif",
              opacity: 0.35,
              pointerEvents: "none",
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
              lineHeight: 1.3,
              textAlign: "left",
              position: "relative",
            }}
          >
            {layout.linhas.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          {p.autor && (
            <Rotulo
              cor={p.corDestaque2}
              tamanho={CONFIG.tamanhoAutor * esc}
              fonte={p.fonteCorpo}
              style={{
                marginTop: 36 * esc,
                opacity: aut,
                transform: `translateX(${(1 - aut) * -16 * esc}px)`,
                letterSpacing: "0.08em",
                textAlign: "left",
              }}
            >
              — {p.autor.toUpperCase()}
            </Rotulo>
          )}
        </div>
      </div>
    </Cartao>
  );
};
