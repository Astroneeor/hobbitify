import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";

interface LandingNavProps {
  loading: boolean;
  session: Session | null;
}

export const LandingNav: React.FC<LandingNavProps> = ({ loading, session }) => (
  <nav className="sticky top-0 z-50 border-b border-border-primary/80 bg-bg-primary/70 backdrop-blur-md">
    <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
      <Link to="/" className="text-xl font-semibold tracking-tight text-text-primary hover:text-accent-light transition-colors">
        hobbitify
      </Link>
      <div className="flex items-center gap-2">
            {!loading && session && (
              <>
                <Link
                  to="/library"
                  className="px-4 py-2 border border-border-secondary hover:border-accent-primary/40 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Library
                </Link>
                <LogoutButton className="px-4 py-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm font-medium" />
              </>
            )}
        {!loading && !session && (
          <Link
            to="/login"
            className="px-4 py-2 border border-border-secondary hover:border-accent-primary/40 text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Sign in
          </Link>
        )}
        <Link
          to={session ? "/getting-started" : "/login"}
          className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg shadow-accent-primary/15"
        >
          {session ? "Generate" : "Get Started"}
        </Link>
      </div>
    </div>
  </nav>
);
