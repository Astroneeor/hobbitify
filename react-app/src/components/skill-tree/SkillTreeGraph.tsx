import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Skill } from "../../types/skill";
import {
  computeSkillTreeLayout,
  GRAPH_NODE_H,
  GRAPH_NODE_W,
} from "../../utils/skillTreeLayout";
import SkillNode from "./SkillNode";

const PADDING = 96;
const ZOOM_MIN = 0.04;
const ZOOM_MAX = 4;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

interface SkillTreeGraphProps {
  skills: Skill[];
  completedSkills: Set<string>;
  selectedSkill: string | null;
  isRoot: (skill: Skill) => boolean;
  isSkillUnlocked: (name: string) => boolean;
  onSelect: (name: string) => void;
  onComplete: (name: string) => void;
}

const SkillTreeGraph: React.FC<SkillTreeGraphProps> = ({
  skills,
  completedSkills,
  selectedSkill,
  isRoot,
  isSkillUnlocked,
  onSelect,
  onComplete,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const { positions, width, height } = useMemo(
    () =>
      computeSkillTreeLayout(skills, {
        nodeWidth: GRAPH_NODE_W,
      }),
    [skills],
  );

  const contentW = width + PADDING * 2;
  const contentH = height + PADDING * 2;

  const edges = useMemo(() => {
    const list: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const s of skills) {
      const p = positions.get(s.Name);
      if (!p || !s.Children?.length) continue;
      for (const childName of s.Children) {
        const c = positions.get(childName);
        if (!c) continue;
        const cxp = p.x + PADDING;
        const cyp = p.y + PADDING;
        const cxc = c.x + PADDING;
        const cyc = c.y + PADDING;
        list.push({
          x1: cxp,
          y1: cyp + GRAPH_NODE_H / 2,
          x2: cxc,
          y2: cyc - GRAPH_NODE_H / 2,
        });
      }
    }
    return list;
  }, [skills, positions]);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el || skills.length === 0) return;
    const rect = el.getBoundingClientRect();
    const z = clamp(
      Math.min(
        (rect.width - 64) / contentW,
        (rect.height - 64) / contentH,
      ),
      ZOOM_MIN,
      1.25,
    );
    setZoom(z);
    setPan({
      x: (rect.width - contentW * z) / 2,
      y: (rect.height - contentH * z) / 2,
    });
  }, [skills.length, contentW, contentH]);

  useEffect(() => {
    fitView();
  }, [fitView]);

  const zoomFromViewportPoint = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      setZoom((prevZ) => {
        const nextZ = clamp(prevZ * factor, ZOOM_MIN, ZOOM_MAX);
        const ratio = nextZ / prevZ;
        setPan((prevP) => ({
          x: mx - (mx - prevP.x) * ratio,
          y: my - (my - prevP.y) * ratio,
        }));
        return nextZ;
      });
    },
    [],
  );

  const zoomFromCenter = useCallback((factor: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    zoomFromViewportPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }, [zoomFromViewportPoint]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      zoomFromViewportPoint(e.clientX, e.clientY, factor);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomFromViewportPoint]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-no-pan]")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    setPan({
      x: d.panX + (e.clientX - d.startX),
      y: d.panY + (e.clientY - d.startY),
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d && d.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  }, []);

  if (skills.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        No skills to display.
      </div>
    );
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border-primary bg-bg-secondary/50 text-[11px] text-text-muted shrink-0">
        <span className="hidden sm:inline">Scroll / trackpad to zoom · Drag background to pan</span>
        <span className="sm:hidden">Pinch or scroll to zoom</span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => zoomFromCenter(1 / 1.2)}
            className="px-2 py-1 rounded-md border border-border-secondary hover:border-accent-primary/50 text-text-secondary hover:text-text-primary font-medium tabular-nums"
          >
            −
          </button>
          <span className="text-text-secondary tabular-nums min-w-[3.25rem] text-center text-xs">
            {zoomPercent}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => zoomFromCenter(1.2)}
            className="px-2 py-1 rounded-md border border-border-secondary hover:border-accent-primary/50 text-text-secondary hover:text-text-primary font-medium tabular-nums"
          >
            +
          </button>
          <button
            type="button"
            onClick={fitView}
            className="px-2 py-1 rounded-md border border-border-secondary hover:border-accent-primary/50 text-text-secondary hover:text-text-primary transition-colors"
          >
            Fit all
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        role="application"
        aria-label="Skill tree map"
        className="flex-1 min-h-[320px] overflow-hidden bg-bg-primary cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            width: contentW,
            height: contentH,
            position: "relative",
          }}
        >
          <svg
            width={contentW}
            height={contentH}
            className="absolute left-0 top-0 pointer-events-none text-accent-primary/35"
            aria-hidden
          >
            <defs>
              <linearGradient id="edge-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {edges.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#edge-grad)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </svg>

          {skills.map((skill) => {
            const p = positions.get(skill.Name);
            if (!p) return null;
            return (
              <div
                key={skill.Name}
                className="absolute"
                style={{
                  left: p.x + PADDING,
                  top: p.y + PADDING,
                  width: GRAPH_NODE_W,
                  marginLeft: -GRAPH_NODE_W / 2,
                  marginTop: -GRAPH_NODE_H / 2,
                  minHeight: GRAPH_NODE_H,
                }}
              >
                <SkillNode
                  compact
                  skill={skill}
                  isSelected={selectedSkill === skill.Name}
                  isCompleted={completedSkills.has(skill.Name)}
                  isUnlocked={isSkillUnlocked(skill.Name)}
                  isRoot={isRoot(skill)}
                  childCount={skill.Children?.length ?? 0}
                  onSelect={onSelect}
                  onComplete={onComplete}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillTreeGraph;
