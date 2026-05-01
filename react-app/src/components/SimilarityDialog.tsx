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
  open,
  matches,
  onUseExisting,
  onGenerateNew,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="similarity-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border-primary bg-bg-secondary shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-primary">
          <h2 id="similarity-title" className="text-lg font-semibold">
            Similar trees already saved
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            We found trees in your library that look close to this goal. Reuse one to save your quota, or generate a brand-new tree anyway.
          </p>
        </div>

        <ul className="max-h-64 overflow-y-auto divide-y divide-border-primary">
          {matches.map((m) => (
            <li key={m.id} className="px-6 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{m.query}</p>
                <p className="text-xs text-text-muted">
                  {m.source === "generated" ? "AI-generated" : "Uploaded"} · score{" "}
                  {m.score.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUseExisting(m.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-medium transition-colors"
              >
                Use this
              </button>
            </li>
          ))}
        </ul>

        <div className="px-6 py-4 flex flex-col sm:flex-row gap-2 sm:justify-end bg-bg-tertiary/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onGenerateNew}
            className="px-4 py-2 rounded-lg border border-accent-primary/50 text-accent-light hover:bg-accent-primary/10 text-sm font-medium transition-colors"
          >
            Generate new anyway
          </button>
        </div>
      </div>
    </div>
  );
};
