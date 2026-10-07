import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const mapaCartaoNoSchema = z.object({
  id: z.string().regex(/^\d+(?:\.\d+)*$/),
  texto: z.string().min(1).max(90),
});

export const mapaMentalCartoesSchema = baseSchema.extend({
  titulo: z.string().max(70).default(""),
  itens: z.array(mapaCartaoNoSchema).min(2).max(16),
});

export type MapaCartaoNo = z.infer<typeof mapaCartaoNoSchema>;
export type MapaMentalCartoesProps = z.infer<typeof mapaMentalCartoesSchema>;

export const defaultProps: MapaMentalCartoesProps = mapaMentalCartoesSchema.parse({
  titulo: "Mapa mental",
  itens: [
    { id: "1", texto: "Tema central" },
    { id: "1.1", texto: "Primeiro ramo" },
    { id: "1.1.1", texto: "Item A" },
    { id: "1.1.2", texto: "Item B" },
    { id: "1.2", texto: "Segundo ramo" },
    { id: "1.2.1", texto: "Item C" },
  ],
  duracaoEmSegundos: 6,
});
