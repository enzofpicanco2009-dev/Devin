import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cartao } from "../../lib/Cartao";
import type { MapaMentalCartoesProps } from "./schema";

type NoRender = {
  id: string;
  texto: string;
  ordem: number[];
};

type CardItem = {
  texto: string;
  startMs: number;
};

type RootNode = {
  kind: "root";
  texto: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startMs: number;
};

type CardNode = {
  kind: "card";
  id: string;
  titulo: string;
  itens: CardItem[];
  cor: string;
  x: number;
  y: number;
  w: number;
  h: number;
  nodeStartMs: number;
  pathStartMs: number;
  path: string;
};

// Cores do snippet de referência.
const COLORS = ["#5eead4", "#60a5fa", "#c4b5fd", "#fbbf24", "#fb7185", "#86efac"];
const ROOT_COLOR = "#5eead4";

// Geometria da "stage" (depois é escalada para o vídeo via fit).
const COL = 460;
const CARD_W = 372;
const CARD_PAD_X = 26;
const CARD_PAD_TOP = 28;
const CARD_PAD_BOTTOM = 30;
const TITLE_FONT = 34;
const TITLE_MB = 18;
const ITEM_FONT = 27;
const ITEM_LH = 1.35;
const ITEM_PAD_Y = 7;
const ROOT_FONT = 44;
const Y_ROOT = 96;
const Y_BR = 320;

// Tempos (ms) — fiéis ao snippet.
const LINE_MS = 400;
const NODE_DELAY_MS = 300;
const NODE_MS = 550;
const ITEM_MS = 400;
const ITEM_GAP_MS = 180;
const AFTER_NODE_MS = 350;
const AFTER_STEP_MS = 100;

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));

const parseOrdem = (id: string): number[] =>
  id
    .split(".")
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n > 0);

const compararOrdem = (a: NoRender, b: NoRender): number => {
  const n = Math.max(a.ordem.length, b.ordem.length);
  for (let i = 0; i < n; i += 1) {
    const av = a.ordem[i] ?? -1;
    const bv = b.ordem[i] ?? -1;
    if (av !== bv) return av - bv;
  }
  return 0;
};

const paiId = (id: string): string | null => {
  const p = id.split(".");
  if (p.length <= 1) return null;
  return p.slice(0, -1).join(".");
};

const filhosDiretos = (nos: NoRender[], id: string): NoRender[] =>
  nos.filter((n) => paiId(n.id) === id).sort(compararOrdem);

const estimarRoot = (texto: string): { w: number; h: number } => {
  const w = clamp(texto.length * ROOT_FONT * 0.55 + 60 * 2, 360, 720);
  const h = ROOT_FONT * 1.2 + 36;
  return { w, h };
};

const alturaCard = (nItens: number): number => {
  const titulo = TITLE_FONT * 1.3;
  const item = ITEM_FONT * ITEM_LH + ITEM_PAD_Y * 2;
  return CARD_PAD_TOP + titulo + TITLE_MB + Math.max(1, nItens) * item + CARD_PAD_BOTTOM;
};

const montar = (
  props: MapaMentalCartoesProps,
): { stageW: number; stageH: number; root: RootNode; cards: CardNode[] } => {
  const itens: NoRender[] = props.itens
    .map((i) => ({ id: i.id, texto: i.texto, ordem: parseOrdem(i.id) }))
    .sort(compararOrdem);

  const rootNo = itens.find((n) => n.id === "1") ?? itens.find((n) => n.ordem.length === 1) ?? null;
  const rootText = rootNo?.texto || props.titulo || "Tema central";

  const ramos = (rootNo
    ? filhosDiretos(itens, rootNo.id)
    : itens.filter((n) => n.ordem.length === 1)
  ).slice(0, 6);

  const stageW = Math.max(1, ramos.length) * COL + 80;
  const cx = stageW / 2;

  const rootDim = estimarRoot(rootText);
  const root: RootNode = {
    kind: "root",
    texto: rootText,
    x: cx,
    y: Y_ROOT,
    w: rootDim.w,
    h: rootDim.h,
    startMs: 0,
  };

  const alturas = ramos.map((r) => alturaCard(filhosDiretos(itens, r.id).length));
  const maxH = alturas.length ? Math.max(...alturas) : alturaCard(0);
  const stageH = Y_BR + maxH + 90;

  // Sequência temporal acumulativa (igual ao snippet).
  let t = root.startMs + AFTER_NODE_MS + AFTER_STEP_MS;

  const cards: CardNode[] = ramos.map((r, i) => {
    const filhos = filhosDiretos(itens, r.id).slice(0, 5);
    const h = alturas[i];
    const x = 40 + COL / 2 + i * COL;
    const y = Y_BR + h / 2;

    const pathStartMs = t;
    const nodeStartMs = t + NODE_DELAY_MS;

    const itensCard: CardItem[] = filhos.map((f, j) => ({
      texto: f.texto,
      startMs: nodeStartMs + AFTER_NODE_MS + j * ITEM_GAP_MS,
    }));

    t = nodeStartMs + AFTER_NODE_MS + filhos.length * ITEM_GAP_MS + AFTER_STEP_MS;

    const x1 = root.x;
    const y1 = root.y + root.h / 2;
    const x2 = x;
    const y2 = Y_BR;
    const mid = (y1 + y2) / 2;
    const path = `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`;

    return {
      kind: "card",
      id: r.id,
      titulo: r.texto,
      itens: itensCard,
      cor: COLORS[i % COLORS.length],
      x,
      y,
      w: CARD_W,
      h,
      nodeStartMs,
      pathStartMs,
      path,
    };
  });

  return { stageW, stageH, root, cards };
};

export const MapaMentalCartoes: React.FC<MapaMentalCartoesProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const { stageW, stageH, root, cards } = React.useMemo(() => montar(p), [p]);

  const fitScale = Math.min(width / stageW, height / stageH) * 0.96;
  const stageLeft = (width - stageW * fitScale) / 2;
  const stageTop = (height - stageH * fitScale) / 2;

  const ms = (v: number) => (v / 1000) * fps;
  const easeOutCss = Easing.bezier(0, 0, 0.58, 1);
  const popCss = Easing.bezier(0.34, 1.56, 0.64, 1);

  const popStyle = (startMs: number) => {
    const show = interpolate(frame, [ms(startMs), ms(startMs + NODE_MS)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: popCss,
    });
    const opacity = interpolate(show, [0, 0.35, 1], [0, 1, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { scale: show, opacity };
  };

  return (
    <Cartao {...p} justify="flex-start">
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: stageLeft,
            top: stageTop,
            width: stageW,
            height: stageH,
            transform: `scale(${fitScale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg width={stageW} height={stageH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {cards.map((c) => {
              const draw = interpolate(frame, [ms(c.pathStartMs), ms(c.pathStartMs + LINE_MS)], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: easeOutCss,
              });
              return (
                <path
                  key={`ln-${c.id}`}
                  d={c.path}
                  fill="none"
                  stroke={p.corDestaque}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={1}
                  strokeDashoffset={1 - draw}
                  pathLength={1}
                />
              );
            })}
          </svg>

          {(() => {
            const r = popStyle(root.startMs);
            return (
              <div
                style={{
                  position: "absolute",
                  left: root.x,
                  top: root.y,
                  width: root.w,
                  height: root.h,
                  transform: `translate(-50%, -50%) scale(${r.scale})`,
                  opacity: r.opacity,
                  background: ROOT_COLOR,
                  color: "#0d1017",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 28px",
                  boxSizing: "border-box",
                  boxShadow: "0 8px 24px rgba(0,0,0,.45)",
                  fontFamily: "Sora, system-ui, sans-serif",
                  fontSize: ROOT_FONT,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {root.texto}
              </div>
            );
          })()}

          {cards.map((c) => {
            const st = popStyle(c.nodeStartMs);
            return (
              <div
                key={`card-${c.id}`}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y,
                  width: c.w,
                  height: c.h,
                  transform: `translate(-50%, -50%) scale(${st.scale})`,
                  opacity: st.opacity,
                  background: "#171c27",
                  border: `2px solid ${c.cor}`,
                  borderRadius: 16,
                  boxShadow: "0 8px 24px rgba(0,0,0,.45)",
                  boxSizing: "border-box",
                  padding: `${CARD_PAD_TOP}px ${CARD_PAD_X}px ${CARD_PAD_BOTTOM}px`,
                  fontFamily: "Sora, system-ui, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    margin: `0 0 ${TITLE_MB}px`,
                    fontSize: TITLE_FONT,
                    fontWeight: 600,
                    color: c.cor,
                    lineHeight: 1.2,
                  }}
                >
                  {c.titulo}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {c.itens.map((it, j) => {
                    const iv = interpolate(frame, [ms(it.startMs), ms(it.startMs + ITEM_MS)], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: popCss,
                    });
                    const itemScale = 0.85 + 0.15 * iv;
                    const tx = (1 - iv) * -8;
                    return (
                      <li
                        key={`it-${c.id}-${j}`}
                        style={{
                          position: "relative",
                          listStyle: "none",
                          padding: `${ITEM_PAD_Y}px 0 ${ITEM_PAD_Y}px 22px`,
                          fontSize: ITEM_FONT,
                          lineHeight: ITEM_LH,
                          color: "#a3adc2",
                          opacity: iv,
                          transform: `translateX(${tx}px) scale(${itemScale})`,
                          transformOrigin: "left center",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "0.78em",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: c.cor,
                          }}
                        />
                        {it.texto}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Cartao>
  );
};

export { mapaMentalCartoesSchema as schema, defaultProps } from "./schema";
