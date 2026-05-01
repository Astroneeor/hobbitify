import type { Skill } from "../types/skill";

/** Card width used for collision bounds (matches graph). */
export const GRAPH_NODE_W = 220;
/** Vertical footprint for edges / fit. */
export const GRAPH_NODE_H = 158;
/** Vertical distance between depth levels (node centers). */
export const GRAPH_V_STRIDE = 210;
/** Gap between adjacent sibling subtrees. */
export const GRAPH_SIBLING_GAP = 40;
/** Each leaf reserves node width + this extra horizontal space. */
export const GRAPH_LEAF_EXTRA = 56;
/** Space between separate root trees. */
export const GRAPH_ROOT_GAP = 120;

export interface LayoutOptions {
  nodeWidth?: number;
  leafExtra?: number;
  siblingGap?: number;
  vStride?: number;
  rootGap?: number;
}

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
  maxDepth: number;
}

interface SubtreeBox {
  width: number;
  pos: Map<string, { x: number; y: number }>;
}

/**
 * Width-aware tree layout: sibling subtrees are placed using each subtree's
 * total width (not a tiny fixed gap), so wide cards do not overlap.
 */
export function computeSkillTreeLayout(
  skills: Skill[],
  options?: LayoutOptions,
): LayoutResult {
  const nodeW = options?.nodeWidth ?? GRAPH_NODE_W;
  const leafExtra = options?.leafExtra ?? GRAPH_LEAF_EXTRA;
  const siblingGap = options?.siblingGap ?? GRAPH_SIBLING_GAP;
  const vStride = options?.vStride ?? GRAPH_V_STRIDE;
  const rootGap = options?.rootGap ?? GRAPH_ROOT_GAP;

  const leafSlotWidth = nodeW + leafExtra;
  const half = nodeW / 2;

  if (skills.length === 0) {
    return { positions: new Map(), width: 0, height: 0, maxDepth: 0 };
  }

  const byName = new Map(skills.map((s) => [s.Name, s]));
  const isRoot = (s: Skill) =>
    !skills.some((x) => x.Children?.includes(s.Name));
  const roots = skills.filter(isRoot);

  const inForest = new Set<string>();
  const visitForest = (s: Skill) => {
    if (inForest.has(s.Name)) return;
    inForest.add(s.Name);
    for (const c of s.Children ?? []) {
      const ch = byName.get(c);
      if (ch) visitForest(ch);
    }
  };
  roots.forEach(visitForest);
  const orphans = skills.filter((s) => !inForest.has(s.Name));
  const forestRoots = [...roots, ...orphans];

  const positions = new Map<string, { x: number; y: number }>();
  let globalOffset = 0;
  let maxDepth = 0;

  const layoutSubtree = (
    s: Skill,
    depth: number,
    stack: Set<string>,
  ): SubtreeBox => {
    const y = depth * vStride;
    maxDepth = Math.max(maxDepth, depth);

    const leafBox = (): SubtreeBox => {
      const w = leafSlotWidth;
      const cx = w / 2;
      return {
        width: w,
        pos: new Map([[s.Name, { x: cx, y }]]),
      };
    };

    if (stack.has(s.Name)) {
      return leafBox();
    }
    stack.add(s.Name);

    const children = (s.Children ?? [])
      .map((n) => byName.get(n))
      .filter((x): x is Skill => Boolean(x));

    if (children.length === 0) {
      stack.delete(s.Name);
      return leafBox();
    }

    const childBoxes = children.map((c) => layoutSubtree(c, depth + 1, stack));

    const merged = new Map<string, { x: number; y: number }>();
    let offset = 0;
    for (let i = 0; i < childBoxes.length; i++) {
      const box = childBoxes[i]!;
      for (const [name, pt] of box.pos) {
        merged.set(name, { x: pt.x + offset, y: pt.y });
      }
      offset += box.width + (i < childBoxes.length - 1 ? siblingGap : 0);
    }

    const rowWidth = offset;

    const childXs = children.map((c) => merged.get(c.Name)!.x);
    const parentX = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    merged.set(s.Name, { x: parentX, y });

    let leftBound = 0;
    let rightBound = rowWidth;
    for (const [, pt] of merged) {
      leftBound = Math.min(leftBound, pt.x - half);
      rightBound = Math.max(rightBound, pt.x + half);
    }

    const width = rightBound - leftBound;
    const shift = -leftBound;
    if (shift !== 0) {
      for (const [name, pt] of merged) {
        merged.set(name, { x: pt.x + shift, y: pt.y });
      }
    }

    stack.delete(s.Name);
    return { width, pos: merged };
  };

  for (const root of forestRoots) {
    const box = layoutSubtree(root, 0, new Set());
    for (const [name, pt] of box.pos) {
      positions.set(name, {
        x: pt.x + globalOffset,
        y: pt.y,
      });
    }
    globalOffset += box.width + rootGap;
  }

  if (forestRoots.length > 0) {
    globalOffset -= rootGap;
  }

  let minEdge = Infinity;
  let maxEdge = -Infinity;
  for (const p of positions.values()) {
    minEdge = Math.min(minEdge, p.x - half);
    maxEdge = Math.max(maxEdge, p.x + half);
  }

  const width = positions.size > 0 ? Math.max(0, maxEdge - minEdge) : 0;
  const height = maxDepth * vStride + vStride;

  return { positions, width, height, maxDepth };
}
