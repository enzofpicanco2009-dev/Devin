import { z } from "zod";

export const springSchema = z.object({
  damping: z.number().default(200),
  stiffness: z.number().default(100),
  mass: z.number().default(1),
});

export const fonteSchema = z
  .object({ familia: z.string(), peso: z.number() })
  .default({ familia: "Inter, Arial, sans-serif", peso: 800 });

export const safeAreaSchema = z
  .object({ topo: z.number(), base: z.number(), lados: z.number() })
  .default({ topo: 5, base: 8, lados: 6 });

/** Props que todo template recebe do M12 (tema + ritmo). */
export const baseSchema = z.object({
  duracaoEmSegundos: z.number().positive(),
  corTexto: z.string().default("#FFFFFF"),
  corTextoSecundario: z.string().default("#B3B3B3"),
  corFundo: z.string().default("#0D0D0D"),
  corFundoSecundario: z.string().default("#1A1A1A"),
  corDestaque: z.string().default("#F5C042"),
  corDestaque2: z.string().default("#42A5F5"),
  corPositivo: z.string().default("#2ECC71"),
  corNegativo: z.string().default("#E74C3C"),
  fonte: fonteSchema,
  fonteCorpo: z
    .object({ familia: z.string(), peso: z.number() })
    .default({ familia: "Inter, Arial, sans-serif", peso: 500 }),
  entradaFrames: z.number().int().default(15),
  saidaFrames: z.number().int().default(10),
  spring: springSchema.default({ damping: 200, stiffness: 100, mass: 1 }),
  safeArea: safeAreaSchema,
});

export type BaseProps = z.infer<typeof baseSchema>;
