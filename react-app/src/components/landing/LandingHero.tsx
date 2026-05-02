import React from "react";

interface LandingHeroProps {
  reduceMotion: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ reduceMotion }) => (
  <section
    className="relative"
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "80px 48px 60px",
      display: "grid",
      gridTemplateColumns: "1.05fr 1fr",
      gap: 60,
      alignItems: "center",
    }}
  >
    {/* Left — copy */}
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <span style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, var(--ink-dim))" }} />
        <span className="hud-label">Learning As An Adventure</span>
      </div>

      <h1
        className={`font-display ${reduceMotion ? "" : "animate-hero-line-a"}`}
        style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.02em", marginBottom: 24, color: "var(--ink)" }}
      >
        Descend into any skill,
        <br />
        <span
          className={reduceMotion ? "" : "animate-hero-line-b"}
          style={{
            fontStyle: "italic",
            background: "linear-gradient(180deg, var(--bio-cyan) 0%, var(--bio-cyan-deep) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          one beacon at a time.
        </span>
      </h1>

      <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-mute)", maxWidth: 480, marginBottom: 36, textWrap: "pretty" } as React.CSSProperties}>
        Hobbitify charts unfamiliar topics like an unmapped sea floor — branching paths,
        hidden currents, and a beacon waiting at every depth. Generate a tree, dive in,
        and leave a trail of unlocked nodes behind you.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          borderTop: "1px solid var(--clay-edge-soft)",
          paddingTop: 24,
          maxWidth: 480,
          gap: 0,
        }}
      >
        {[
          { num: "10", label: "Trees max" },
          { num: "5",  label: "AI generations" },
          { num: "50", label: "Nodes per tree" },
        ].map(({ num, label }) => (
          <div key={label}>
            <div className="font-display" style={{ fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>{num}</div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: "1.8px", textTransform: "uppercase", color: "var(--ink-dim)", marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Right — scan panel preview */}
    <div className="scan-panel" style={{ display: "none" }} aria-hidden>
      {/* Hidden on mobile/medium — shown on large screens via CSS below */}
    </div>
    <div
      className="scan-panel"
      style={{ height: 440 }}
    >
      <div className="scan-panel-head">
        <span>SCAN.LOG // SKILL_BIOME</span>
        <div className="scan-panel-dots">
          <span className="scan-dot scan-dot-live" />
          <span className="scan-dot" />
          <span className="scan-dot" />
        </div>
      </div>
      <div className="sonar">
        <div className="sonar-grid" />
        <div className="sonar-ring" />
        <div className="sonar-ring" />
        <div className="sonar-ring" />
        <div className="sonar-ping" />

        {/* Edge preview lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 540 400" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="edgeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="oklch(0.85 0.16 200)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="oklch(0.65 0.18 210)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M145 85 Q 215 155 265 195"  stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
          <path d="M265 195 Q 345 245 435 315" stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
          <path d="M265 195 Q 195 275 105 335" stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
          <path d="M145 85 Q 85 145 55 215"   stroke="oklch(0.40 0.06 215 / 0.5)"  strokeWidth="1" fill="none" strokeDasharray="2 4" />
        </svg>

        <div className="pv-node pv-node--unlocked" style={{ left: "16%", top: "14%" }}><span className="pv-marker" />Field Foundations</div>
        <div className="pv-node pv-node--active"   style={{ left: "41%", top: "39%" }}><span className="pv-marker" />Core Concepts</div>
        <div className="pv-node pv-node--unlocked" style={{ left: "66%", top: "68%" }}><span className="pv-marker" />Applied Skills</div>
        <div className="pv-node pv-node--locked"   style={{ left: "6%",  top: "74%" }}><span className="pv-marker" />Advanced Theory</div>
        <div className="pv-node pv-node--locked"   style={{ left: "3%",  top: "44%" }}><span className="pv-marker" />Deep Mastery</div>
      </div>
    </div>
  </section>
);
