import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cartao } from "../../lib/Cartao";
import type { MapaMentalProps } from "./schema";

type NoRender = {
  id: string;
  texto: string;
  ordem: number[];
};

type BranchPalette = {
  line: string;
  fill: string;
  leafFill: string;
  text: string;
};

type Branch = {
  id: string;
  texto: string;
  cor: BranchPalette;
  filhos: NoRender[];
};

type NodeKind = "root" | "branch" | "leaf";

type Node = {
  key: string;
  id: string;
  texto: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  side: -1 | 0 | 1;
  style: {
    fill: string;
    border: string;
    text: string;
  };
};

type Step = {
  index: number;
  node: Node;
  from?: Node;
  side?: -1 | 1;
  lineColor: string;
  lineWidth: number;
};

type Link = {
  path: string;
  color: string;
  width: number;
  stepIndex: number;
};

const PALETTE: BranchPalette[] = [
  { line: "#5B9EF3", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
  { line: "#F79B45", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
  { line: "#B06BF0", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
  { line: "#F4C736", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
  { line: "#37C7B5", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
  { line: "#F07195", fill: "#141A24", leafFill: "#121720", text: "#E8ECF4" },
];

const ROOT_FILL = "#161B24";
const ROOT_BORDER = "#F4C736";
const ROOT_TEXT = "#F6F8FC";

const STAGE_W = 2400;
const ROW_GAP = 190;
const BRANCH_X = 560;
const LEAF_X = 1010;
const STEP_MS = 260;
const LINE_MS = 400;
const NODE_DELAY_MS = 300;
const NODE_MS = 550;

const LEGIBLE_MARGIN_X = 52;
const LEGIBLE_MARGIN_Y = 46;
const MIN_NODE_GAP = 30;
const MIN_LAYOUT_SCALE = 0.45;
const MAX_LAYOUT_SCALE = 1.4;

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

const estimarDimensoes = (texto: string, kind: NodeKind): { w: number; h: number } => {
  const fonte = kind === "root" ? 64 : kind === "branch" ? 46 : 36;
  const padX = kind === "root" ? 60 : kind === "branch" ? 42 : 32;
  const padY = kind === "root" ? 42 : kind === "branch" ? 32 : 24;
  const fator = kind === "root" ? 0.55 : 0.52;
  const minW = kind === "root" ? 460 : kind === "branch" ? 360 : 280;
  const maxW = kind === "root" ? 660 : kind === "branch" ? 540 : 420;
  const bruto = texto.length * fonte * fator + padX * 2;
  const w = clamp(bruto, minW, maxW);
  const h = clamp(fonte * 1.2 + padY * 2, kind === "leaf" ? 108 : 150, kind === "root" ? 300 : 240);
  return { w, h };
};

const curva = (from: Node, to: Node, side: -1 | 1): string => {
  const x1 = from.x + side * (from.w / 2);
  const y1 = from.y;
  const x2 = to.x - side * (to.w / 2);
  const y2 = to.y;
  const m = (x1 + x2) / 2;
  return `M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`;
};

const distribuirLados = (branches: Branch[]): { direita: Branch[]; esquerda: Branch[] } => {
  const direita: Branch[] = [];
  const esquerda: Branch[] = [];
  let somaDir = 0;
  let somaEsq = 0;

  for (const b of branches) {
    const peso = Math.max(1, b.filhos.length);
    if (somaDir <= somaEsq) {
      direita.push(b);
      somaDir += peso;
    } else {
      esquerda.push(b);
      somaEsq += peso;
    }
  }

  if (esquerda.length === 0 && direita.length > 1) {
    const mov = direita.pop();
    if (mov) esquerda.push(mov);
  }

  return { direita, esquerda };
};

const maxScale = (nodes: Node[], steps: Step[], stageW: number, stageH: number): number => {
  let kMax = Number.POSITIVE_INFINITY;
  const l = LEGIBLE_MARGIN_X;
  const r = stageW - LEGIBLE_MARGIN_X;
  const t = LEGIBLE_MARGIN_Y;
  const b = stageH - LEGIBLE_MARGIN_Y;

  for (const n of nodes) {
    kMax = Math.min(kMax, (2 * (n.x - l)) / n.w, (2 * (r - n.x)) / n.w, (2 * (n.y - t)) / n.h, (2 * (b - n.y)) / n.h);
  }

  for (const s of steps) {
    if (!s.from) continue;
    const distX = Math.abs(s.node.x - s.from.x);
    const gap = s.from.kind === "root" ? MIN_NODE_GAP + 10 : MIN_NODE_GAP;
    const lim = (2 * (distX - gap)) / (s.node.w + s.from.w);
    kMax = Math.min(kMax, lim);
  }

  const colunas = new Map<number, Node[]>();
  for (const n of nodes) {
    const key = Math.round(n.x);
    if (!colunas.has(key)) colunas.set(key, []);
    colunas.get(key)?.push(n);
  }
  for (const grupo of colunas.values()) {
    const ord = [...grupo].sort((a, b2) => a.y - b2.y);
    for (let i = 1; i < ord.length; i += 1) {
      const a = ord[i - 1];
      const c = ord[i];
      const lim = (2 * (Math.abs(c.y - a.y) - MIN_NODE_GAP)) / (a.h + c.h);
      kMax = Math.min(kMax, lim);
    }
  }

  if (!Number.isFinite(kMax) || kMax <= 0) return MIN_LAYOUT_SCALE;
  return clamp(kMax, MIN_LAYOUT_SCALE, MAX_LAYOUT_SCALE);
};

const montar = (
  props: MapaMentalProps,
): { stageW: number; stageH: number; steps: Step[]; links: Link[]; layoutScale: number } => {
  const itens: NoRender[] = props.itens
    .map((i) => ({ id: i.id, texto: i.texto, ordem: parseOrdem(i.id) }))
    .sort(compararOrdem);

  const rootNo = itens.find((n) => n.id === "1") ?? itens.find((n) => n.ordem.length === 1) ?? null;
  const rootText = rootNo?.texto || props.titulo || "Core topic";

  const primarios = (rootNo
    ? filhosDiretos(itens, rootNo.id)
    : itens.filter((n) => n.ordem.length === 1)
  ).slice(0, 8);

  const branches: Branch[] = primarios.map((p, idx) => ({
    id: p.id,
    texto: p.texto,
    cor: PALETTE[idx % PALETTE.length],
    filhos: filhosDiretos(itens, p.id).slice(0, 4),
  }));

  const { direita, esquerda } = distribuirLados(branches);
  const totalDir = direita.reduce((s, b) => s + Math.max(1, b.filhos.length), 0);
  const totalEsq = esquerda.reduce((s, b) => s + Math.max(1, b.filhos.length), 0);
  const rows = Math.max(totalDir, totalEsq, 2);

  const stageW = STAGE_W;
  const stageH = rows * ROW_GAP + 360;
  const cx = stageW / 2;
  const cy = stageH / 2;

  const rootDim = estimarDimensoes(rootText, "root");
  const root: Node = {
    key: "root",
    id: rootNo?.id ?? "1",
    texto: rootText,
    kind: "root",
    x: cx,
    y: cy,
    w: rootDim.w,
    h: rootDim.h,
    side: 0,
    style: { fill: ROOT_FILL, border: ROOT_BORDER, text: ROOT_TEXT },
  };

  const steps: Step[] = [{ index: 0, node: root, lineColor: ROOT_BORDER, lineWidth: 0 }];

  const addSide = (lista: Branch[], side: -1 | 1) => {
    const total = lista.reduce((s, b) => s + Math.max(1, b.filhos.length), 0);
    let row = 0;
    const top = cy - ((total - 1) * ROW_GAP) / 2;

    for (const b of lista) {
      const filhos = b.filhos.length ? b.filhos : [{ id: `${b.id}.0`, texto: b.texto, ordem: [] } as NoRender];
      const ys = filhos.map((_, i) => top + (row + i) * ROW_GAP);
      row += filhos.length;
      const by = (ys[0] + ys[ys.length - 1]) / 2;

      const dB = estimarDimensoes(b.texto, "branch");
      const nodeB: Node = {
        key: `b-${b.id}`,
        id: b.id,
        texto: b.texto,
        kind: "branch",
        x: cx + side * BRANCH_X,
        y: by,
        w: dB.w,
        h: dB.h,
        side,
        style: { fill: b.cor.fill, border: b.cor.line, text: b.cor.text },
      };

      steps.push({
        index: steps.length,
        node: nodeB,
        from: root,
        side,
        lineColor: b.cor.line,
        lineWidth: 22,
      });

      for (let i = 0; i < filhos.length; i += 1) {
        const f = filhos[i];
        const dK = estimarDimensoes(f.texto, "leaf");
        const nodeK: Node = {
          key: `k-${f.id}`,
          id: f.id,
          texto: f.texto,
          kind: "leaf",
          x: cx + side * LEAF_X,
          y: ys[i],
          w: dK.w,
          h: dK.h,
          side,
          style: { fill: b.cor.leafFill, border: b.cor.line, text: b.cor.text },
        };

        steps.push({
          index: steps.length,
          node: nodeK,
          from: nodeB,
          side,
          lineColor: b.cor.line,
          lineWidth: 5,
        });
      }
    }
  };

  addSide(direita, 1);
  addSide(esquerda, -1);

  const nodesBase = steps.map((s) => s.node);
  const layoutScale = maxScale(nodesBase, steps, stageW, stageH);

  const scaledByKey = new Map(
    nodesBase.map((n) => [
      n.key,
      {
        ...n,
        w: n.w * layoutScale,
        h: n.h * layoutScale,
      },
    ]),
  );

  const scaledSteps: Step[] = steps.map((s) => ({
    ...s,
    node: scaledByKey.get(s.node.key) as Node,
    from: s.from ? (scaledByKey.get(s.from.key) as Node) : undefined,
    lineWidth: s.lineWidth * layoutScale,
  }));

  const links: Link[] = scaledSteps
    .filter((s) => s.from && s.side)
    .map((s) => ({
      path: curva(s.from as Node, s.node, s.side as -1 | 1),
      color: s.lineColor,
      width: s.lineWidth,
      stepIndex: s.index,
    }));

  return { stageW, stageH, steps: scaledSteps, links, layoutScale };
};

export const MapaMentalConectado: React.FC<MapaMentalProps> = (p) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const { stageW, stageH, steps, links, layoutScale } = React.useMemo(() => montar(p), [p]);

  const fitScale = Math.min(width / stageW, height / stageH) * 0.965;
  const stageLeft = (width - stageW * fitScale) / 2;
  const stageTop = (height - stageH * fitScale) / 2;

  const stepFrames = (STEP_MS / 1000) * fps;
  const lineFrames = (LINE_MS / 1000) * fps;
  const nodeDelayFrames = (NODE_DELAY_MS / 1000) * fps;
  const nodeFrames = (NODE_MS / 1000) * fps;

  const easeOutCss = Easing.bezier(0, 0, 0.58, 1);
  const popCss = Easing.bezier(0.34, 1.56, 0.64, 1);

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
            {links.map((ln, i) => {
              const start = ln.stepIndex * stepFrames;
              const progress = interpolate(frame, [start, start + lineFrames], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: easeOutCss,
              });

              return (
                <path
                  key={`ln-${i}`}
                  d={ln.path}
                  fill="none"
                  stroke={p.corDestaque}
                  strokeWidth={ln.width}
                  strokeLinecap="round"
                  strokeOpacity={0.95}
                  strokeDasharray={1}
                  strokeDashoffset={1 - progress}
                  pathLength={1}
                />
              );
            })}
          </svg>

          {steps.map((sinfo) => {
            const stepStart = sinfo.index * stepFrames;
            const start = stepStart + (sinfo.from ? nodeDelayFrames : 0);
            const show = interpolate(frame, [start, start + nodeFrames], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: popCss,
            });
            const opacity = interpolate(show, [0, 0.35, 1], [0, 1, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const n = sinfo.node;
            const isRoot = n.kind === "root";
            const isBranch = n.kind === "branch";
            const font = (isRoot ? 64 : isBranch ? 46 : 36) * layoutScale;

            return (
              <div
                key={n.key}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: n.w,
                  height: n.h,
                  transform: `translate(-50%, -50%) scale(${show})`,
                  opacity,
                  borderRadius: isRoot ? 32 * layoutScale : 999,
                  background: n.style.fill,
                  border: `${(isRoot ? 4 : isBranch ? 6 : 4) * layoutScale}px solid ${n.style.border}`,
                  boxShadow: `0 ${10 * layoutScale}px ${30 * layoutScale}px rgba(0,0,0,.45)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: isRoot ? `${24 * layoutScale}px ${38 * layoutScale}px` : `${16 * layoutScale}px ${24 * layoutScale}px`,
                  boxSizing: "border-box",
                  color: n.style.text,
                  fontFamily: "Sora, system-ui, sans-serif",
                  fontSize: font,
                  fontWeight: isRoot || isBranch ? 600 : 500,
                  lineHeight: 1.12,
                  letterSpacing: "-0.01em",
                  whiteSpace: "normal",
                  textWrap: "balance",
                }}
              >
                {n.texto}
              </div>
            );
          })}
        </div>
      </div>
    </Cartao>
  );
};

export const MapaMental = MapaMentalConectado;

export { mapaMentalSchema as schema, defaultProps } from "./schema";
