import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const planilhaSchema = baseSchema
  .extend({
    titulo: z.string().optional(),
    colunas: z.array(z.string()).min(2).max(4),
    linhas: z.array(z.array(z.string())).min(1).max(5),
    destacar_coluna: z.number().int().nonnegative().optional(),
    destacar_linha: z.number().int().nonnegative().optional(),
  })
  .refine((dados) => dados.linhas.every((linha) => linha.length === dados.colunas.length), {
    message: "Cada linha deve ter o mesmo numero de celulas que colunas.",
    path: ["linhas"],
  });

export type PlanilhaProps = z.infer<typeof planilhaSchema>;

export const defaultProps: PlanilhaProps = planilhaSchema.parse({
  titulo: "Planos disponiveis",
  colunas: ["Plano", "Preco", "Usuarios"],
  linhas: [
    ["Basico", "R$ 29", "1"],
    ["Pro", "R$ 79", "5"],
    ["Empresarial", "R$ 199", "Ilimitado"],
  ],
  destacar_coluna: 0,
  destacar_linha: 1,
  duracaoEmSegundos: 6,
});
