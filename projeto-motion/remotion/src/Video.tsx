import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { registry, isTemplateId, type TemplateEntry } from "./templates/_registry";
import type { Timeline } from "./timeline";
import { LegendaSincronizada as LegendaRodape } from "./lib/LegendaSincronizada";
import { FundoMidia } from "./lib/FundoMidia";

export const Video: React.FC<Timeline> = (timeline) => {
  const { fps } = useVideoConfig();
  const legendasAtivas = timeline.config_video?.legendas_ativas ?? false;
  const palavrasPorLinha = timeline.config_video?.palavras_por_linha ?? 5;

  return (
    <AbsoluteFill style={{ backgroundColor: timeline.cor_fundo }}>
      {timeline.audio.arquivo && (
        <Audio src={staticFile(timeline.audio.arquivo)} />
      )}
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
        const comFundoMidia = Boolean(cena.fundo_override?.src);
        const baseProps = {
          ...cena.props_finais,
          duracaoEmSegundos: duration / fps,
        } as Record<string, unknown>;
        if (comFundoMidia) {
          // Com mídia de fundo ativa, removemos o plano de fundo do template.
          if (typeof baseProps.corFundo === "string") {
            baseProps.corFundo = "transparent";
          }
        }
        const props = entry.schema.parse({
          ...baseProps,
        }) as Record<string, unknown>;
        return (
          <Sequence
            key={cena.id}
            from={from}
            durationInFrames={duration}
            name={`${cena.id} ${cena.decisao.template}`}
          >
            <>
              {cena.fundo_override && <FundoMidia fundo={cena.fundo_override} startFromFrame={0} />}
              <entry.Component {...props} />
              {legendasAtivas &&
                cena.decisao.template !== "LegendaSincronizada" &&
                cena.palavras.length > 0 && (
                  <LegendaRodape
                    palavras={cena.palavras.map((p) => ({
                      ...p,
                      s: Math.max(0, p.s - cena.render_start_s),
                      e: Math.max(0, p.e - cena.render_start_s),
                    }))}
                    palavrasPorLinha={palavrasPorLinha}
                    tema={{
                      corTexto: String(props.corTexto ?? "#FFFFFF"),
                      corDestaque: String(props.corDestaque ?? "#F5C042"),
                      fonteCorpo: (props.fonteCorpo as {
                        familia: string;
                        peso: number;
                      }) ?? { familia: "Inter, Arial, sans-serif", peso: 500 },
                    }}
                  />
                )}
            </>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
