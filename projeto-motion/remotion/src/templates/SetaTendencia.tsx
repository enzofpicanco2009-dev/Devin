import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
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
  const desenho = interpolate(frame, [2, fps * 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const txt = useEntrada(Math.round(fps * 0.18), p.spring, 30);
  const deBaixo = p.animacaoEntrada === "de_baixo";
  const deCima = p.animacaoEntrada === "de_cima";
  const vertical = height > width;
  const W = width * (vertical ? 0.9 : 0.92);
  const H = height * (vertical ? 0.62 : 0.72);

  // Seta minimalista em zigue-zague, inspirada no layout de referência.
  const pts = sobe
    ? [
        [W * 0.14, H * 0.82],
        [W * 0.43, H * 0.50],
        [W * 0.56, H * 0.63],
        [W * 0.87, H * 0.24],
      ]
    : [
        [W * 0.14, H * 0.20],
        [W * 0.42, H * 0.44],
        [W * 0.58, H * 0.34],
        [W * 0.86, H * 0.72],
      ];
  const [tipX, tipY] = pts[pts.length - 1];
  const [prevX, prevY] = pts[pts.length - 2];
  const ang = Math.atan2(tipY - prevY, tipX - prevX);
  const s = 182 * esc;
  const larguraSeta = 90 * esc;
  const recuoCorpo = s * 0.84;
  const endX = tipX - recuoCorpo * Math.cos(ang);
  const endY = tipY - recuoCorpo * Math.sin(ang);
  const ptsCorpo = [...pts.slice(0, -1), [endX, endY]];
  const d = ptsCorpo.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const comp = W * 2.2;
  const pontaOp = interpolate(desenho, [0.72, 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ponta = [
    [tipX, tipY],
    [endX + s * 0.14 * Math.cos(ang) - s * 0.86 * Math.cos(ang - 0.57), endY + s * 0.14 * Math.sin(ang) - s * 0.86 * Math.sin(ang - 0.57)],
    [endX + s * 0.14 * Math.cos(ang) - s * 0.86 * Math.cos(ang + 0.57), endY + s * 0.14 * Math.sin(ang) - s * 0.86 * Math.sin(ang + 0.57)],
  ]
    .map((q) => q.join(","))
    .join(" ");

  const deslocEntradaY = deBaixo
    ? (1 - txt) * 120 * esc
    : deCima
      ? (1 - txt) * -120 * esc
      : 0;
  const lateralAlvo = (vertical ? 0.09 : 0.14) * width;
  const deslocLateral = interpolate(txt, [0, 1], [0, sobe ? -lateralAlvo : lateralAlvo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const topTexto = vertical ? (sobe ? "36%" : "34%") : sobe ? "34%" : "32%";

  return (
    <Cartao {...p}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <svg
          width={W + s}
          height={H + s}
          viewBox={`${-s / 2} ${-s / 2} ${W + s} ${H + s}`}
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            overflow: "visible",
          }}
        >
          <path
            d={d}
            fill="none"
            stroke={cor}
            strokeOpacity={0.18}
            strokeWidth={larguraSeta * 1.16}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={comp}
            strokeDashoffset={comp * (1 - desenho)}
          />
          <path
            d={d}
            fill="none"
            stroke={cor}
            strokeWidth={larguraSeta}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={comp}
            strokeDashoffset={comp * (1 - desenho)}
          />
          <polygon points={ponta} fill={cor} opacity={pontaOp} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: topTexto,
            textAlign: sobe ? "left" : "right",
            opacity: txt,
            transform: `translate(-50%, -50%) translateX(${deslocLateral}px) translateY(${deslocEntradaY}px) scale(${0.94 + txt * 0.06})`,
            width: vertical ? "74%" : "60%",
            pointerEvents: "none",
          }}
        >
          {p.valor && (
            <div
              style={{
                fontWeight: Math.max(800, Number(p.fonte.peso) || 800),
                fontSize: (vertical ? 186 : 224) * esc,
                color: cor,
                lineHeight: 0.94,
                letterSpacing: "-0.028em",
                textShadow: `0 ${8 * esc}px ${24 * esc}px rgba(0,0,0,0.28)`,
              }}
            >
              {p.valor}
            </div>
          )}
          {p.texto && (
            <Rotulo
              cor={p.corTexto}
              tamanho={(vertical ? 68 : 78) * esc}
              fonte={p.fonteCorpo}
              style={{
                marginTop: 22 * esc,
                fontWeight: Math.max(700, Number(p.fonteCorpo.peso) || 700),
                lineHeight: 1.08,
                letterSpacing: "-0.012em",
                textShadow: `0 ${6 * esc}px ${18 * esc}px rgba(0,0,0,0.24)`,
              }}
            >
              {p.texto}
            </Rotulo>
          )}
        </div>
      </div>
    </Cartao>
  );
};
