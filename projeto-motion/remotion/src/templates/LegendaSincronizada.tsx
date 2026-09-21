import React from "react";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import {
  LegendaSincronizada as CamadaLegendaSincronizada,
  type PalavraTempo,
} from "../lib/LegendaSincronizada";

const palavraTempoSchema = z.object({
  w: z.string(),
  s: z.number().min(0),
  e: z.number().min(0),
});

export const schema = baseSchema.extend({
  palavras: z.array(palavraTempoSchema).default([]),
  palavrasPorLinha: z.number().int().positive().default(5),
});

export type LegendaSincronizadaProps = z.infer<typeof schema>;

export const defaultProps: LegendaSincronizadaProps = schema.parse({
  duracaoEmSegundos: 4,
  palavras: [],
  palavrasPorLinha: 5,
});

export const LegendaSincronizada: React.FC<LegendaSincronizadaProps> = ({
  palavras,
  palavrasPorLinha,
  corTexto,
  corDestaque,
  fonteCorpo,
}) => {
  return (
    <CamadaLegendaSincronizada
      palavras={palavras as PalavraTempo[]}
      palavrasPorLinha={palavrasPorLinha}
      tema={{ corTexto, corDestaque, fonteCorpo }}
    />
  );
};
