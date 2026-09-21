import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, useEscala } from "../lib/Cartao";
import { ajustarTexto } from "../lib/layoutTexto";

export const schema = baseSchema.extend({
  texto: z.string(),
  destaque_frases: z.array(z.string()).optional(),
});

export type TextoLongoProps = z.infer<typeof schema>;

export const defaultProps: TextoLongoProps = schema.parse({
  texto:
    "O aumento de 40% nas exportacoes no ultimo trimestre surpreendeu analistas do mercado financeiro.",
  destaque_frases: ["aumento de 40%"],
  duracaoEmSegundos: 6,
});

function montarPartes(texto: string, destaques: string[] = []) {
  if (destaques.length === 0) return [{ texto, destaque: false }];

  let partes: { texto: string; destaque: boolean }[] = [{ texto, destaque: false }];

  for (const frase of destaques) {
    const novasPartes: typeof partes = [];
    for (const parte of partes) {
      if (parte.destaque || !parte.texto.includes(frase)) {
        novasPartes.push(parte);
        continue;
      }
      const [antes, ...resto] = parte.texto.split(frase);
      const depois = resto.join(frase);
      if (antes) novasPartes.push({ texto: antes, destaque: false });
      novasPartes.push({ texto: frase, destaque: true });
      if (depois) novasPartes.push({ texto: depois, destaque: false });
    }
    partes = novasPartes;
  }

  return partes;
}

export const TextoLongo: React.FC<TextoLongoProps> = ({
  texto,
  destaque_frases,
  ...base
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const esc = useEscala();

  const totalPalavras = texto.split(" ").filter(Boolean).length;
  const framesParaRevelarTudo = Math.max(1, durationInFrames * 0.7);

  const layout = ajustarTexto(texto, {
    tamanhoMax: 62,
    tamanhoMin: 30,
    maxLinhas: 8,
    maxCaracteresLinha: 45,
  });
  const partes = montarPartes(layout.linhas.join(" "), destaque_frases);

  let contadorPalavras = 0;

  return (
    <Cartao {...base} justify="center">
      <div
        style={{
          fontFamily: base.fonteCorpo.familia,
          fontSize: layout.tamanhoFonte * esc,
          lineHeight: 1.35,
          color: base.corTexto,
          textAlign: "center",
          maxWidth: "90%",
        }}
      >
        {partes.map((parte, i) => {
          const palavrasDaParte = parte.texto.split(" ").filter(Boolean);
          return palavrasDaParte.map((palavra, j) => {
            const indiceGlobal = contadorPalavras++;
            const frameInicio =
              (indiceGlobal / Math.max(1, totalPalavras)) * framesParaRevelarTudo;
            const opacity = interpolate(
              frame,
              [frameInicio, frameInicio + fps * 0.15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <span
                key={`${i}-${j}`}
                style={{
                  opacity,
                  color: parte.destaque ? base.corDestaque : base.corTexto,
                  fontWeight: parte.destaque ? 700 : 500,
                }}
              >
                {palavra}{" "}
              </span>
            );
          });
        })}
      </div>
    </Cartao>
  );
};
