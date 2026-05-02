import React from "react";

const features = [
  {
    tag: "01",
    title: "Sonar-mapped paths",
    desc: "Drop a topic, get a navigable lattice of prerequisites and adjacent rabbit holes — automatically grouped by depth.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49" /><path d="M7.76 7.76a6 6 0 0 0 0 8.49" />
        <path d="M20.07 4.93a10 10 0 0 1 0 14.14" /><path d="M3.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
  {
    tag: "02",
    title: "Bioluminescent progress",
    desc: "Nodes light up as you complete objectives. Pressure builds, currents shift, and your path gets clearer the deeper you go.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 3v12" /><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M15 6a9 9 0 0 1 0 12" /><path d="M6 9h3" />
      </svg>
    ),
  },
  {
    tag: "03",
    title: "Portable charts",
    desc: "Save trees to your library, branch from any node, or export the whole biome as JSON for offline diving.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
      </svg>
    ),
  },
];

export const LandingFeatures: React.FC = () => (
  <section
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 18,
      maxWidth: 1280,
      margin: "0 auto",
      padding: "20px 48px 40px",
    }}
  >
    {features.map((f) => (
      <div key={f.tag} className="feature-card">
        <div className="font-mono" style={{ position: "absolute", top: 16, right: 18, fontSize: 9, letterSpacing: "1.5px", color: "var(--ink-dim)" }}>
          {f.tag}
        </div>
        <div className="feature-icon-wrap">{f.icon}</div>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--ink)" }}>
          {f.title}
        </h3>
        <p style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink-mute)" }}>{f.desc}</p>
      </div>
    ))}
  </section>
);
