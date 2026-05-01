import type { Session } from "@supabase/supabase-js";
import React from "react";
import { Link } from "react-router-dom";

interface LandingFooterProps {
  session: Session | null;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ session }) => (
  <footer className="border-t border-border-primary bg-bg-secondary/40">
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
      <p className="text-sm text-text-muted">
        <span className="font-semibold text-text-secondary">hobbitify</span>
        <span className="mx-2 text-border-secondary">·</span>
        Skill trees for curious humans
      </p>
      <div className="flex items-center gap-6 text-sm">
        <Link
          to={session ? "/library" : "/login"}
          className="text-text-muted hover:text-accent-light transition-colors"
        >
          {session ? "Library" : "Sign in"}
        </Link>
        <Link
          to={session ? "/getting-started" : "/login"}
          className="text-accent-light hover:text-accent-primary transition-colors font-medium"
        >
          {session ? "Open generator" : "Get started"}
        </Link>
      </div>
    </div>
  </footer>
);
