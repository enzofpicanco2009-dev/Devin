import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { timelineSchema, timelineVazia } from "./timeline";
import { registry } from "./templates/_registry";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video}
        schema={timelineSchema}
        defaultProps={timelineVazia}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={240}
        calculateMetadata={({ props }) => ({
          width: props.formato.largura,
          height: props.formato.altura,
          fps: props.formato.fps,
          durationInFrames: Math.max(
            1,
            Math.round(props.audio.duracao_s * props.formato.fps),
          ),
        })}
      />
      <Composition
        id="TituloImpacto"
        component={registry.TituloImpacto.Component}
        schema={registry.TituloImpacto.schema}
        defaultProps={registry.TituloImpacto.defaultProps}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={120}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Math.round(props.duracaoEmSegundos * 30)),
        })}
      />
    </>
  );
};
