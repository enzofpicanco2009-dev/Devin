import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { registry, isTemplateId, type TemplateEntry } from "./templates/_registry";
import type { Timeline } from "./timeline";

export const Video: React.FC<Timeline> = (timeline) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: timeline.cor_fundo }}>
      {timeline.cenas.map((cena) => {
        if (!isTemplateId(cena.decisao.template)) {
          throw new Error(
            `Cena ${cena.id}: template "${cena.decisao.template}" não existe no registry`,
          );
        }
        const entry: TemplateEntry = registry[cena.decisao.template];
        const from = Math.round(cena.render_start_s * fps);
        const to = Math.round(cena.render_end_s * fps);
        const duration = Math.max(1, to - from);
        const props = entry.schema.parse({
          ...cena.props_finais,
          duracaoEmSegundos: duration / fps,
        }) as Record<string, unknown>;
        return (
          <Sequence
            key={cena.id}
            from={from}
            durationInFrames={duration}
            name={`${cena.id} ${cena.decisao.template}`}
          >
            <entry.Component {...props} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
