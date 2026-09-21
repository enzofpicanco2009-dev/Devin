import { z } from "zod";
import { baseSchema } from "../../lib/base";

export const eventoTimelineSchema = z.object({
  marcador: z.string(),
  descricao: z.string(),
});

export const timelineSchema = baseSchema.extend({
  titulo: z.string().optional(),
  eventos: z.array(eventoTimelineSchema).min(2).max(6),
  orientacao: z.enum(["horizontal", "vertical"]).default("horizontal"),
});

export type EventoTimeline = z.infer<typeof eventoTimelineSchema>;
export type TimelineProps = z.infer<typeof timelineSchema>;

export const defaultProps: TimelineProps = timelineSchema.parse({
  titulo: "Trajetoria da empresa",
  eventos: [
    { marcador: "2019", descricao: "Fundacao" },
    { marcador: "2021", descricao: "Primeira rodada" },
    { marcador: "2024", descricao: "IPO" },
  ],
  orientacao: "horizontal",
  duracaoEmSegundos: 7,
});
