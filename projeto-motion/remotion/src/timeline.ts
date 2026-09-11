import { z } from "zod";

export const cenaRenderSchema = z.object({
  id: z.string(),
  indice: z.number().int(),
  render_start_s: z.number().min(0),
  render_end_s: z.number().positive(),
  decisao: z.object({ template: z.string() }),
  props_finais: z.record(z.string(), z.unknown()),
});

export const formatoSchema = z.object({
  id: z.string(),
  largura: z.number().int().positive(),
  altura: z.number().int().positive(),
  fps: z.number().positive(),
});

export const timelineSchema = z.object({
  schema_version: z.number().int(),
  projeto_id: z.string(),
  audio: z.object({ duracao_s: z.number().positive() }),
  formato: formatoSchema,
  cenas: z.array(cenaRenderSchema),
  cor_fundo: z.string().default("#0D0D0D"),
});

export type Timeline = z.infer<typeof timelineSchema>;
export type CenaRender = z.infer<typeof cenaRenderSchema>;

export const timelineVazia: Timeline = {
  schema_version: 1,
  projeto_id: "preview",
  audio: { duracao_s: 8 },
  formato: { id: "16x9", largura: 1920, altura: 1080, fps: 30 },
  cor_fundo: "#0D0D0D",
  cenas: [
    {
      id: "c001",
      indice: 0,
      render_start_s: 0,
      render_end_s: 4,
      decisao: { template: "TituloImpacto" },
      props_finais: {
        texto: "A Selic é a taxa que define tudo.",
        duracaoEmSegundos: 4,
        palavrasDestaque: ["Selic"],
      },
    },
    {
      id: "c002",
      indice: 1,
      render_start_s: 4,
      render_end_s: 8,
      decisao: { template: "TituloImpacto" },
      props_finais: {
        texto: "E quase ninguém entende como ela funciona.",
        duracaoEmSegundos: 4,
      },
    },
  ],
};
