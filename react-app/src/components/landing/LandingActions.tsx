import type { Session } from "@supabase/supabase-js";
import React, { RefObject } from "react";
import { Link } from "react-router-dom";

interface LandingActionsProps {
  session: Session | null;
  loadError: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onExample: () => void;
  onLoadClick: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LandingActions: React.FC<LandingActionsProps> = ({
  session,
  loadError,
  fileInputRef,
  onExample,
  onLoadClick,
  onImport,
}) => (
  <div className="max-w-2xl mx-auto px-6 mt-12 flex flex-col items-center gap-4">
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto">
      <Link
        to={session ? "/getting-started" : "/login"}
        className="inline-flex justify-center px-10 py-4 rounded-full bg-accent-primary hover:bg-accent-hover text-white font-semibold text-lg transition-all duration-300 shadow-xl shadow-accent-primary/25 hover:shadow-accent-primary/35 hover:-translate-y-0.5"
      >
        {session ? "Build a skill tree" : "Sign in to generate"}
      </Link>

      <button
        type="button"
        onClick={onExample}
        className="inline-flex justify-center px-10 py-4 rounded-full border border-border-secondary hover:border-accent-primary/50 text-text-secondary hover:text-text-primary font-medium text-lg transition-all duration-300 bg-bg-tertiary/50 hover:bg-bg-hover/80"
      >
        See example tree
      </button>
    </div>

    <button
      type="button"
      onClick={onLoadClick}
      className="text-sm text-text-muted hover:text-accent-light transition-colors underline underline-offset-4 decoration-border-secondary hover:decoration-accent-primary/50"
    >
      Load existing JSON (offline)
    </button>
    {loadError && <p className="text-xs text-error">{loadError}</p>}

    <input
      ref={fileInputRef as React.Ref<HTMLInputElement>}
      type="file"
      accept=".json,application/json"
      onChange={onImport}
      className="hidden"
    />
  </div>
);
