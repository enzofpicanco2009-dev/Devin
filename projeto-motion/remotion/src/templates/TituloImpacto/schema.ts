import { z } from "zod";

export const springSchema = z.object({
  damping: z.number(),
  stiffness: z.number(),
  mass: z.number(),
});

export const schema = z.object({
  texto: z.string(),
  linhas: z.array(z.string()).optional(),
  duracaoEmSegundos: z.number().positive(),
  corTexto: z.string().default("#FFFFFF"),
  corFundo: z.string().default("#0D0D0D"),
  corDestaque: z.string().default("#F5C042"),
  palavrasDestaque: z.array(z.string()).default([]),
  fonte: z
    .object({ familia: z.string(), peso: z.number() })
    .default({ familia: "Inter, Arial, sans-serif", peso: 800 }),
  tamanhoFonte: z.number().default(84),
  entradaFrames: z.number().int().default(15),
  saidaFrames: z.number().int().default(10),
  deslocamentoEntradaPx: z.number().default(40),
  spring: springSchema.default({ damping: 200, stiffness: 100, mass: 1 }),
  safeArea: z
    .object({ topo: z.number(), base: z.number(), lados: z.number() })
    .default({ topo: 5, base: 8, lados: 6 }),
});

export type TituloImpactoProps = z.infer<typeof schema>;

export const defaultProps: TituloImpactoProps = schema.parse({
  texto: "A Selic é a taxa que define tudo.",
  duracaoEmSegundos: 4,
  palavrasDestaque: ["Selic"],
});
