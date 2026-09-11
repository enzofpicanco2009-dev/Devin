import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { baseSchema } from "../lib/base";
import { Cartao, Rotulo, useEntrada, useEscala } from "../lib/Cartao";

export const schema = baseSchema.extend({
  direcao: z.enum(["sobe", "desce"]),
  texto: z.string().default(""),
  valor: z.string().default(""),
  positivoQuandoSobe: z.boolean().default(true),
});
export type Props = z.infer<typeof schema>;
export const defaultProps: Props = schema.parse({
  direcao: "sobe",
  texto: "Selic subiu",
  valor: "+1,5 p.p.",
  duracaoEmSegundos: 4,
});

export const SetaTendencia: React.FC<Props> = (p) => {
  const esc = useEscala();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sobe = p.direcao === "sobe";
  const bom = sobe === p.positivoQuandoSobe;
  const cor = bom ? p.corPositivo : p.corNegativo;
  const desenho = interpolate(frame, [4, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const txt = useEntrada(Math.round(fps * 0.6), p.spring, 20);
  const vertical = height > width;
  const W = 900 * esc;
  const H = 520 * esc;
  // linha em degraus subindo/descendo, com ponta de seta
  const pts = sobe
    ? [
        [0, H * 0.85],
        [W * 0.3, H * 0.7],
        [W * 0.5, H * 0.8],
        [W * 0.75, H * 0.35],
        [W, H * 0.12],
      ]
    : [
        [0, H * 0.15],
        [W * 0.3, H * 0.3],
        [W * 0.5, H * 0.2],
        [W * 0.75, H * 0.65],
        [W, H * 0.88],
      ];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const comp = W * 1.6;
  const [px, py] = pts[pts.length - 1];
  const ang = Math.atan2(py - pts[3][1], px - pts[3][0]);
  const pontaOp = desenho > 0.97 ? 1 : 0;
  const s = 46 * esc;
  const ponta = [
    [px, py],
    [px - s * Math.cos(ang - 0.5), py - s * Math.sin(ang - 0.5)],
    [px - s * Math.cos(ang + 0.5), py - s * Math.sin(ang + 0.5)],
  ]
    .map((q) => q.join(","))
    .join(" ");
  return (
    <Cartao {...p}>
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          gap: 60 * esc,
        }}
      >
        <svg width={W + s} height={H + s} viewBox={`${-s / 2} ${-s / 2} ${W + s} ${H + s}`}>
          <path
            d={d}
            fill="none"
            stroke={cor}
            strokeWidth={18 * esc}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={comp}
            strokeDashoffset={comp * (1 - desenho)}
          />
          <polygon points={ponta} fill={cor} opacity={pontaOp} />
        </svg>
        <div style={{ textAlign: "center", opacity: txt, transform: `translateY(${(1 - txt) * 30}px)` }}>
          {p.valor && (
            <div style={{ fontWeight: p.fonte.peso, fontSize: 150 * esc, color: cor, lineHeight: 1 }}>
              {p.valor}
            </div>
          )}
          {p.texto && (
            <Rotulo cor={p.corTexto} tamanho={52 * esc} fonte={p.fonteCorpo} style={{ marginTop: 20 * esc }}>
              {p.texto}
            </Rotulo>
          )}
        </div>
      </div>
    </Cartao>
  );
};
