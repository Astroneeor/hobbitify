import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";

interface LandingNavProps {
  loading: boolean;
  session: Session | null;
}

export const LandingNav: React.FC<LandingNavProps> = ({ loading, session }) => (
  <nav className="chrome">
    <Link to="/" className="brand">
      <span className="brand-glyph" />
      hobbitify
    </Link>

    <div className="nav-actions">
      {!loading && session && (
        <>
          <Link to="/library" className="btn btn--ghost btn-sm">
            Library
          </Link>
          <LogoutButton className="btn btn--ghost btn-sm" />
        </>
      )}
      {!loading && !session && (
        <Link to="/login" className="btn btn--ghost btn-sm">
          Sign in
        </Link>
      )}
      <Link
        to={session ? "/getting-started" : "/login"}
        className="btn btn--primary btn-sm"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M12 3l1.9 5.8L20 9l-4.5 4.4 1.1 6.1L12 16.4 7.4 19.5l1.1-6.1L4 9l6.1-.2z"/>
        </svg>
        {session ? "Generate" : "Get started"}
      </Link>
    </div>
  </nav>
);
