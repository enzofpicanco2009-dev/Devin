import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { ajustarTexto } from "../lib/layoutTexto";
import { Cartao, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  texto: z.string(),
  tamanhoFonte: z.number().default(76),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  texto: "Por que a Selic importa pra você?",
  duracaoEmSegundos: 4,
});

export const Pergunta: React.FC<Props> = (p) => {
  const esc = useEscala();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const marca = useEntrada(0, { damping: 12, stiffness: 120, mass: 0.8 }, 30);
  const txt = useEntrada(Math.round(fps * 0.5), p.spring, 22);
  const deBaixo = p.animacaoEntrada === "de_baixo";
  const deCima = p.animacaoEntrada === "de_cima";
  const pulso = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 2);
  const layout = ajustarTexto(p.texto.replace(/\?+$/, ""), {
    tamanhoMax: p.tamanhoFonte,
    tamanhoMin: 44,
    maxLinhas: 3,
    maxCaracteresLinha: 30,
  });
  return (
    <Cartao {...p}>
      <div
        style={{
          fontWeight: 900,
          fontSize: 300 * esc,
          lineHeight: 0.9,
          color: p.corDestaque,
          transform: deBaixo
            ? `translateY(${(1 - marca) * 140 * esc}px) scale(${0.9 + 0.1 * marca * pulso})`
            : deCima
              ? `translateY(${(1 - marca) * -140 * esc}px) scale(${0.9 + 0.1 * marca * pulso})`
              : `scale(${marca * pulso}) rotate(${(1 - marca) * -20}deg)`,
          opacity: marca,
          marginBottom: 30 * esc,
        }}
      >
        ?
      </div>
      <div
        style={{
          fontWeight: p.fonte.peso,
          fontSize: layout.tamanhoFonte * esc,
          lineHeight: 1.15,
          textAlign: "center",
          opacity: txt,
          transform: deBaixo
            ? `translateY(${(1 - txt) * 120 * esc}px)`
            : deCima
              ? `translateY(${(1 - txt) * -120 * esc}px)`
              : `translateY(0px)`,
        }}
      >
        {layout.linhas.map((l, i) => (
          <div key={i}>
            {l}
            {i === layout.linhas.length - 1 ? "?" : ""}
          </div>
        ))}
      </div>
    </Cartao>
  );
};
