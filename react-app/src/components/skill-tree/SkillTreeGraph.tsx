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
    () => computeSkillTreeLayout(skills, { nodeWidth: GRAPH_NODE_W }),
    [skills],
  );

  const contentW = width + PADDING * 2;
  const contentH = height + PADDING * 2;

  const edges = useMemo(() => {
    const list: {
      x1: number; y1: number; x2: number; y2: number;
      lit: boolean;
    }[] = [];
    for (const s of skills) {
      const p = positions.get(s.Name);
      if (!p || !s.Children?.length) continue;
      for (const childName of s.Children) {
        const c = positions.get(childName);
        if (!c) continue;
        list.push({
          x1: p.x + PADDING,
          y1: p.y + PADDING + GRAPH_NODE_H / 2,
          x2: c.x + PADDING,
          y2: c.y + PADDING - GRAPH_NODE_H / 2,
          lit: completedSkills.has(s.Name),
        });
      }
    }
    return list;
  }, [skills, positions, completedSkills, isSkillUnlocked]);

  const fitView = useCallback(() => {
    const el = viewportRef.current;
    if (!el || skills.length === 0) return;
    const rect = el.getBoundingClientRect();
    const z = clamp(
      Math.min((rect.width - 64) / contentW, (rect.height - 64) / contentH),
      ZOOM_MIN, 1.25,
    );
    setZoom(z);
    setPan({ x: (rect.width - contentW * z) / 2, y: (rect.height - contentH * z) / 2 });
  }, [skills.length, contentW, contentH]);

  useEffect(() => { fitView(); }, [fitView]);

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
        setPan((prevP) => ({ x: mx - (mx - prevP.x) * ratio, y: my - (my - prevP.y) * ratio }));
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
      e.stopPropagation();
      zoomFromViewportPoint(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 1 / 1.1);
    };
    el.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => el.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions);
  }, [zoomFromViewportPoint]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-no-pan]")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    },
    [pan.x, pan.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    setPan({ x: d.panX + (e.clientX - d.startX), y: d.panY + (e.clientY - d.startY) });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }, []);

  if (skills.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: "var(--ink-dim)", fontSize: 13 }}>
        No skills to display.
      </div>
    );
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0">
      {/* Zoom toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderBottom: "1px solid var(--clay-edge-soft)",
          background: "oklch(0.18 0.014 235 / 0.6)",
          backdropFilter: "blur(8px)",
          flexShrink: 0,
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "1.5px",
          color: "var(--ink-dim)",
        }}
      >
        <span className="hidden sm:inline" style={{ letterSpacing: "1.5px" }}>
          DRAG · PAN &nbsp;|&nbsp; SCROLL · DEPTH
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <div className="zoom-controls">
            <button className="zoom-btn" type="button" aria-label="Zoom out" onClick={() => zoomFromCenter(1 / 1.2)}>−</button>
            <div className="zoom-pct">{zoomPercent}%</div>
            <button className="zoom-btn" type="button" aria-label="Zoom in"  onClick={() => zoomFromCenter(1.2)}>+</button>
            <button className="zoom-btn" type="button" onClick={fitView} title="Fit all" style={{ fontSize: 11 }}>⊡</button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={viewportRef}
        role="application"
        aria-label="Skill tree map"
        className="flex-1 min-h-0 overflow-hidden overscroll-contain tree-canvas-bg touch-none select-none"
        style={{ cursor: dragRef.current ? "grabbing" : "grab", position: "relative" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Grid pattern */}
        <div className="canvas-grid" />

        {/* Stage */}
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
          {/* Edges */}
          <svg
            width={contentW}
            height={contentH}
            style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", overflow: "visible" }}
            aria-hidden
          >
            <defs>
              <linearGradient id="edge-lit" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="oklch(0.65 0.18 210)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="oklch(0.50 0.14 215)" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="edge-dim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="oklch(0.32 0.05 220)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="oklch(0.28 0.04 225)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {edges.map((e, i) => {
              const midY = (e.y1 + e.y2) / 2;
              const path = `M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`;
              return (
                <path
                  key={i}
                  d={path}
                  stroke={e.lit ? "url(#edge-lit)" : "url(#edge-dim)"}
                  strokeWidth={e.lit ? 1.5 : 1}
                  strokeDasharray={e.lit ? "0" : "3 5"}
                  fill="none"
                  style={{ filter: e.lit ? "drop-shadow(0 0 4px oklch(0.65 0.18 210 / 0.6))" : "none" }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {skills.map((skill) => {
            const p = positions.get(skill.Name);
            if (!p) return null;
            return (
              <div
                key={skill.Name}
                style={{
                  position: "absolute",
                  left: p.x + PADDING,
                  top:  p.y + PADDING,
                  marginLeft: -GRAPH_NODE_W / 2,
                  marginTop:  -GRAPH_NODE_H / 2,
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

        {/* Canvas vignette */}
        <div className="canvas-vignette" />

        {/* Help strip */}
        <div className="tree-help" aria-hidden>
          <span><kbd>DRAG</kbd>pan</span>
          <span><kbd>SCROLL</kbd>zoom</span>
          <span><kbd>CLICK</kbd>scan</span>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeGraph;
