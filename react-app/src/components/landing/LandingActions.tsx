import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link } from "react-router-dom";

interface LandingActionsProps {
  session: Session | null;
  loadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
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
  <section
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "8px 48px 32px",
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      alignItems: "center",
    }}
  >
    <Link to={session ? "/getting-started" : "/login"} className="btn btn--primary">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
      </svg>
      Generate a tree
    </Link>

    <button className="btn" onClick={onLoadClick}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      Load JSON
    </button>

    <button className="btn btn--ghost" onClick={onExample}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      View demo
    </button>

    <input ref={fileInputRef} type="file" accept=".json" onChange={onImport} className="hidden" />

    {loadError && (
      <p className="font-mono" style={{ fontSize: 11, color: "var(--bio-coral)", letterSpacing: "0.5px", marginLeft: 4 }}>
        {loadError}
      </p>
    )}
  </section>
);
