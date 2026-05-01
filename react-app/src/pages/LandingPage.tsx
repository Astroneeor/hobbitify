import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CSS_SKILL_TREE } from "../data/testSkillTrees";
import { useAuth } from "../contexts/AuthContext";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleExample = () => {
    navigate("/skill-tree", { state: { response: CSS_SKILL_TREE } });
  };

  const handleLoadClick = () => {
    setLoadError(null);
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result;
        if (typeof raw !== "string") {
          setLoadError("Unable to read file contents.");
          return;
        }

        const parsed = JSON.parse(raw);
        navigate("/skill-tree", { state: { response: parsed } });
      } catch {
        setLoadError("Invalid JSON file. Please pick a valid export.");
      }
    };
    reader.onerror = () => {
      setLoadError("Failed to read selected file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <nav className="border-b border-border-primary">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-3">
          <div className="text-xl font-semibold">hobbitify</div>
          <div className="flex items-center gap-2">
            {!loading && session && (
              <Link
                to="/library"
                className="px-4 py-2 border border-border-primary hover:border-border-secondary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Library
              </Link>
            )}
            {!loading && !session && (
              <Link
                to="/login"
                className="px-4 py-2 border border-border-primary hover:border-border-secondary text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Sign in
              </Link>
            )}
            <Link
              to={session ? "/getting-started" : "/login"}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-all duration-200 font-medium text-sm"
            >
              {session ? "Generate" : "Get Started"}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-text-primary via-accent-light to-accent-primary bg-clip-text text-transparent">
          Turn any skill into an interactive learning journey
        </h1>

        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your learning goals into RPG-style skill trees. Sign in to save trees to your library, upload JSON exports, and get AI paths tailored to you.
        </p>

        <div className="bg-bg-tertiary rounded-2xl p-8 mb-12 max-w-2xl mx-auto">
          <div className="text-text-secondary mb-4 text-sm uppercase tracking-wide font-medium">
            I want to learn how to
          </div>

          <div className="relative h-16 overflow-hidden rounded-lg border border-border-secondary bg-bg-secondary">
            <div className="absolute inset-0 flex items-center justify-center animate-scroll">
              <div className="flex flex-col items-center space-y-4">
                {[
                  "master woodworking",
                  "play dungeons & dragons",
                  "knit a cozy sweater",
                  "spin a pen like a pro",
                  "carve beautiful soapstone",
                  "dominate at geoguesser",
                  "collect rare insects",
                  "create pyrography art",
                  "craft handmade journals",
                ].map((skill, index) => (
                  <div key={index} className="h-16 flex items-center text-lg font-medium whitespace-nowrap">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-text-muted text-sm">
            Each skill becomes a visual, step-by-step learning path
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={session ? "/getting-started" : "/login"}
            className="px-8 py-4 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-accent-primary/25"
          >
            {session ? "Build a skill tree" : "Sign in to generate"}
          </Link>

          <button
            type="button"
            onClick={handleExample}
            className="px-8 py-4 border border-border-secondary hover:border-border-primary text-text-secondary hover:text-text-primary rounded-xl font-medium text-lg transition-all duration-200"
          >
            See example tree
          </button>
        </div>
        <div className="mt-3 flex flex-col items-center">
          <button
            type="button"
            onClick={handleLoadClick}
            className="text-xs text-text-muted hover:text-text-secondary underline underline-offset-2 transition-colors"
          >
            Load existing JSON (offline)
          </button>
          {loadError && <p className="mt-2 text-xs text-error">{loadError}</p>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />

        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-powered</h3>
            <p className="text-text-secondary text-sm">
              Claude builds structured skill trees from your goals. Free tier includes a limited number of generations — upload JSON to track more offline trees.
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Your library</h3>
            <p className="text-text-secondary text-sm">
              Sign in with Supabase to save trees, see similar past goals before burning a generation, and delete what you no longer need.
            </p>
          </div>

          <div className="bg-bg-tertiary rounded-xl p-6 border border-border-primary hover:border-border-secondary transition-colors duration-200">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Structured learning</h3>
            <p className="text-text-secondary text-sm">
              Break complex skills into manageable steps. Each node has concrete completion criteria and unlock rules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
