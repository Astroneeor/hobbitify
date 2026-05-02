import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link } from "react-router-dom";

interface LandingFooterProps {
  session: Session | null;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ session }) => (
  <footer
    style={{
      borderTop: "1px solid var(--clay-edge-soft)",
      background: "linear-gradient(180deg, oklch(0.14 0.012 240 / 0.4), oklch(0.10 0.010 245 / 0.6))",
      padding: "32px 48px",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 18, height: 18, background: "var(--bio-cyan)", borderRadius: "50%", boxShadow: "var(--bio-glow-cyan)", display: "inline-block" }} />
      <span className="font-display" style={{ fontSize: 18, color: "var(--ink)" }}>hobbitify</span>
    </div>

    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      {session && (
        <>
          <Link to="/getting-started" className="font-mono" style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", textDecoration: "none" }}>
            Generate
          </Link>
          <Link to="/library" className="font-mono" style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", textDecoration: "none" }}>
            Library
          </Link>
        </>
      )}
      {!session && (
        <Link to="/login" className="font-mono" style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-dim)", textDecoration: "none" }}>
          Sign in
        </Link>
      )}
    </div>

    <div className="font-mono" style={{ fontSize: 10, letterSpacing: "1px", color: "var(--ink-dim)" }}>
      © {new Date().getFullYear()} hobbitify — free tier
    </div>
  </footer>
);
