import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const mapaNoSchema = z.object({
  id: z.string().regex(/^\d+(?:\.\d+)*$/),
  texto: z.string().min(1).max(90),
});

export const mapaMentalSchema = baseSchema.extend({
  titulo: z.string().max(70).default(""),
  itens: z.array(mapaNoSchema).min(2).max(16),
});

export type MapaNo = z.infer<typeof mapaNoSchema>;
export type MapaMentalProps = z.infer<typeof mapaMentalSchema>;

export const defaultProps: MapaMentalProps = mapaMentalSchema.parse({
  titulo: "Mapa mental",
  itens: [
    { id: "1", texto: "Tema central" },
    { id: "1.1", texto: "Primeiro ramo" },
    { id: "1.2", texto: "Segundo ramo" },
    { id: "1.1.1", texto: "Detalhe importante" },
  ],
  duracaoEmSegundos: 6,
});
