import { z } from "zod";

type FundoOverride = {
  src: string;
  tipo: "imagem" | "video";
  brilho: number;
  contraste: number;
  saturacao: number;
  desfoque_px: number;
  opacidade: number;
  escurecer: number;
  zoom: number;
  fit_mode: "cover" | "contain" | "fill" | "fit";
  posicao_x: number;
  posicao_y: number;
  blend_mode: "normal" | "multiply" | "screen" | "overlay";
  camadas: FundoOverride[];
};

export const palavraTempoSchema = z.object({
  w: z.string(),
  s: z.number().min(0),
  e: z.number().min(0),
});

export const fundoOverrideSchema: z.ZodType<FundoOverride> = z.lazy(() => z.object({
  src: z.string(),
  tipo: z.enum(["imagem", "video"]).default("imagem"),
  brilho: z.number().min(0.2).max(2.5).default(1),
  contraste: z.number().min(0.2).max(2.5).default(1),
  saturacao: z.number().min(0).max(3).default(1),
  desfoque_px: z.number().min(0).max(20).default(0),
  opacidade: z.number().min(0).max(1).default(1),
  escurecer: z.number().min(0).max(0.95).default(0),
  zoom: z.number().min(0.1).max(3).default(1),
  fit_mode: z.enum(["cover", "contain", "fill", "fit"]).default("cover"),
  posicao_x: z.number().min(0).max(1).default(0.5),
  posicao_y: z.number().min(0).max(1).default(0.5),
  blend_mode: z.enum(["normal", "multiply", "screen", "overlay"]).default("normal"),
  camadas: z.array(fundoOverrideSchema).default([]),
}));

export const cenaRenderSchema = z.object({
  id: z.string(),
  indice: z.number().int(),
  render_start_s: z.number().min(0),
  render_end_s: z.number().positive(),
  decisao: z.object({ template: z.string() }),
  props_finais: z.record(z.string(), z.unknown()),
  fundo_override: fundoOverrideSchema.optional(),
  palavras: z.array(palavraTempoSchema).default([]),
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
  audio: z.object({ duracao_s: z.number().positive(), arquivo: z.string().optional() }),
  formato: formatoSchema,
  cenas: z.array(cenaRenderSchema),
  cor_fundo: z.string().default("#0D0D0D"),
  config_video: z
    .object({
      legendas_ativas: z.boolean().default(false),
      palavras_por_linha: z.number().int().positive().default(5),
    })
    .default({ legendas_ativas: false, palavras_por_linha: 5 }),
});

export type Timeline = z.infer<typeof timelineSchema>;
export type CenaRender = z.infer<typeof cenaRenderSchema>;

export const timelineVazia: Timeline = {
  schema_version: 1,
  projeto_id: "preview",
  audio: { duracao_s: 8, arquivo: undefined },
  formato: { id: "16x9", largura: 1920, altura: 1080, fps: 30 },
  cor_fundo: "#0D0D0D",
  config_video: {
    legendas_ativas: false,
    palavras_por_linha: 5,
  },
  cenas: [
    {
      id: "c001",
      indice: 0,
      render_start_s: 0,
      render_end_s: 4,
      decisao: { template: "TituloImpacto" },
      palavras: [],
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
      palavras: [],
      props_finais: {
        texto: "E quase ninguém entende como ela funciona.",
        duracaoEmSegundos: 4,
      },
    },
  ],
};
