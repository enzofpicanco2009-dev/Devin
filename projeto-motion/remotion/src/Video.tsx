import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { registry, isTemplateId, type TemplateEntry } from "./templates/_registry";
import type { Timeline } from "./timeline";
import { LegendaSincronizada as LegendaTemplate } from "./templates/LegendaSincronizada";

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
            <>
              <entry.Component {...props} />
              {legendasAtivas && cena.palavras.length > 0 && (
                <LegendaTemplate
                  duracaoEmSegundos={duration / fps}
                  palavras={cena.palavras.map((p) => ({
                    ...p,
                    s: Math.max(0, p.s - cena.render_start_s),
                    e: Math.max(0, p.e - cena.render_start_s),
                  }))}
                  palavrasPorLinha={palavrasPorLinha}
                  corTexto={String(props.corTexto ?? "#FFFFFF")}
                  corDestaque={String(props.corDestaque ?? "#F5C042")}
                  fonte={
                    (props.fonte as { familia: string; peso: number }) ?? {
                      familia: "Inter, Arial, sans-serif",
                      peso: 800,
                    }
                  }
                  fonteCorpo={
                    (props.fonteCorpo as { familia: string; peso: number }) ?? {
                      familia: "Inter, Arial, sans-serif",
                      peso: 500,
                    }
                  }
                  entradaFrames={15}
                  saidaFrames={10}
                  spring={{ damping: 200, stiffness: 100, mass: 1 }}
                  safeArea={{ topo: 5, base: 8, lados: 6 }}
                  corTextoSecundario={String(props.corTextoSecundario ?? "#B3B3B3")}
                  corFundo={String(props.corFundo ?? "#0D0D0D")}
                  corFundoSecundario={String(props.corFundoSecundario ?? "#1A1A1A")}
                  corDestaque2={String(props.corDestaque2 ?? "#42A5F5")}
                  corPositivo={String(props.corPositivo ?? "#2ECC71")}
                  corNegativo={String(props.corNegativo ?? "#E74C3C")}
                />
              )}
            </>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
