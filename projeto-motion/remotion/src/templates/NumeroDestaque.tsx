import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";
import { useJanela } from "../lib/janela";

// BLOCO 1 — campos que a IA preenche (roteiro):
//   valor      (obrigatório) -> número como o narrador diz ("13,75%", "R$ 2 mil")
//   rotulo     (opcional)    -> o que o número significa (≤ 6 palavras)
//   sentimento (opcional)    -> positivo | negativo | neutro (define a cor)
// O M12 decompõe `valor` em numero/prefixo/sufixo/decimais para a contagem.

// BLOCO 2 — design fixo do template
const CONFIG = {
  tamanhoPadrao: 220,
  tamanhoRotulo: 44,
  tamanhoPrefixoSufixo: 0.45, // fração do tamanho do número
  janelaContagem: [0, 0.8] as const,
  contagemMaxS: 2.2,
  contagemMinS: 0.8,
  escalaInicial: 0.82,
  larguraLinhaPx: 140,
};

export const schema = baseSchema.extend({
  valor: z.string(),
  numero: z.number().nullable().default(null),
  prefixo: z.string().default(""),
  sufixo: z.string().default(""),
  decimais: z.number().int().default(0),
  rotulo: z.string().default(""),
  sentimento: z.enum(["positivo", "negativo", "neutro"]).default("neutro"),
  tamanhoFonte: z.number().default(CONFIG.tamanhoPadrao),
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
  const esc = useEscala();
  const ent = useEntrada(0, p.spring, 25);
  const rot = useEntrada(10, p.spring, 20);
  const contagem = useJanela(CONFIG.janelaContagem[0], CONFIG.janelaContagem[1], {
    maxS: CONFIG.contagemMaxS,
    minS: CONFIG.contagemMinS,
  });
  const cor =
    p.sentimento === "positivo"
      ? p.corPositivo
      : p.sentimento === "negativo"
        ? p.corNegativo
        : p.corDestaque;
  const tamSec = p.tamanhoFonte * CONFIG.tamanhoPrefixoSufixo * esc;
  return (
    <Cartao {...p}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          fontWeight: p.fonte.peso,
          lineHeight: 1,
          color: cor,
          letterSpacing: "-0.04em",
          opacity: ent,
          transform: `scale(${CONFIG.escalaInicial + (1 - CONFIG.escalaInicial) * ent})`,
          fontVariantNumeric: "tabular-nums",
          maxWidth: "100%",
        }}
      >
        {p.numero === null ? (
          <span style={{ fontSize: p.tamanhoFonte * esc }}>{p.valor}</span>
        ) : (
          <>
            {p.prefixo && (
              <span style={{ fontSize: tamSec, marginRight: 8 * esc, opacity: 0.85 }}>
                {p.prefixo.trim()}
              </span>
            )}
            <span style={{ fontSize: p.tamanhoFonte * esc }}>
              {fmt(p.numero * contagem, p.decimais)}
            </span>
            {p.sufixo && (
              <span style={{ fontSize: tamSec, marginLeft: 6 * esc, opacity: 0.85 }}>
                {p.sufixo.trim()}
              </span>
            )}
          </>
        )}
      </div>
      <div
        style={{
          width: CONFIG.larguraLinhaPx * esc * rot,
          height: 5 * esc,
          borderRadius: 999,
          background: cor,
          marginTop: 34 * esc,
          opacity: 0.8,
        }}
      />
      {p.rotulo && (
        <Rotulo
          cor={p.corTextoSecundario}
          tamanho={CONFIG.tamanhoRotulo * esc}
          fonte={p.fonteCorpo}
          style={{
            marginTop: 26 * esc,
            opacity: rot,
            transform: `translateY(${(1 - rot) * 14 * esc}px)`,
          }}
        >
          {p.rotulo}
        </Rotulo>
      )}
    </Cartao>
  );
};
