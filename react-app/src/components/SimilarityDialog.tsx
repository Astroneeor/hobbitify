import React from "react";
import type { SimilarMatch } from "../utils/apiUtils";

interface SimilarityDialogProps {
  open: boolean;
  matches: SimilarMatch[];
  onUseExisting: (id: string) => void;
  onGenerateNew: () => void;
  onClose: () => void;
}

export const SimilarityDialog: React.FC<SimilarityDialogProps> = ({
  open, matches, onUseExisting, onGenerateNew, onClose,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="similarity-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "oklch(0.06 0.01 240 / 0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="clay-card-deep"
        style={{ width: "100%", maxWidth: 520, overflow: "hidden", animation: "slideInPanel 0.25s cubic-bezier(.2,.8,.2,1)" }}
      >
        {/* Head */}
        <div className="detail-head" style={{ padding: "14px 20px" }}>
          <span className="detail-htag">◉ SIMILARITY.SCAN</span>
          <button className="detail-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Description */}
        <div style={{ padding: "16px 20px 12px" }}>
          <h2
            id="similarity-title"
            style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}
          >
            Similar biomes already charted
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.55 }}>
            We found trees in your library that look close to this goal. Reuse one to save your quota, or chart a brand-new biome anyway.
          </p>
        </div>

        {/* Match list */}
        <ul style={{ maxHeight: 240, overflowY: "auto", borderTop: "1px solid var(--clay-edge-soft)", borderBottom: "1px solid var(--clay-edge-soft)", listStyle: "none", padding: 0 }}>
          {matches.map((m) => (
            <li
              key={m.id}
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderBottom: "1px solid var(--clay-edge-soft)",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                  {m.query}
                </p>
                <p className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>
                  {m.source === "generated" ? "AI-GEN" : "UPLOAD"} · score {m.score.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUseExisting(m.id)}
                className="btn btn--primary btn-sm"
              >
                Use this
              </button>
            </li>
          ))}
        </ul>

        {/* Footer actions */}
        <div style={{ padding: "14px 20px", display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" onClick={onClose} className="btn btn--ghost btn-sm">
            Cancel
          </button>
          <button type="button" onClick={onGenerateNew} className="btn btn-sm" style={{ borderColor: "oklch(0.55 0.14 210 / 0.5)", color: "var(--bio-cyan)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
            </svg>
            Generate new anyway
          </button>
        </div>
      </div>
    </div>
  );
};
