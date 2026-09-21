import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const ctaFinalSchema = baseSchema.extend({
  texto_principal: z.string(),
  subtexto: z.string().optional(),
  mostrar_logo: z.boolean().default(false),
  estilo_botao: z.enum(["solido", "contorno"]).default("solido"),
  logo_src: z.string().optional(),
});

export type CTAFinalProps = z.infer<typeof ctaFinalSchema>;

export const defaultProps: CTAFinalProps = ctaFinalSchema.parse({
  texto_principal: "Gostou? Inscreva-se",
  subtexto: "Novo video toda semana",
  mostrar_logo: false,
  estilo_botao: "solido",
  duracaoEmSegundos: 4,
});
