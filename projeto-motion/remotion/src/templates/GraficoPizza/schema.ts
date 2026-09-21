import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const fatiaSchema = z.object({
  rotulo: z.string(),
  valor: z.number().positive(),
});

export const graficoPizzaSchema = baseSchema.extend({
  titulo: z.string().optional(),
  fatias: z.array(fatiaSchema).min(2).max(6),
  estilo: z.enum(["pizza", "donut"]).default("pizza"),
  destacar_indice: z.number().int().nonnegative().optional(),
});

export type Fatia = z.infer<typeof fatiaSchema>;
export type GraficoPizzaProps = z.infer<typeof graficoPizzaSchema>;

export const defaultProps: GraficoPizzaProps = graficoPizzaSchema.parse({
  titulo: "Participacao de mercado",
  fatias: [
    { rotulo: "Empresa A", valor: 45 },
    { rotulo: "Empresa B", valor: 30 },
    { rotulo: "Outras", valor: 25 },
  ],
  estilo: "donut",
  destacar_indice: 0,
  duracaoEmSegundos: 6,
});
