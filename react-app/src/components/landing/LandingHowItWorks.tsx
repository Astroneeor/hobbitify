import React from "react";

const steps = [
  { num: "01", title: "Drop a goal",   desc: "Type any skill, hobby, or topic you want to learn — from quilting to quantum field theory." },
  { num: "02", title: "Chart the biome", desc: "Claude maps prerequisites, adjacent skills, and depth levels into a navigable skill tree." },
  { num: "03", title: "Dive in",       desc: "Work through nodes in order — each completed skill unlocks the next layer of the tree." },
];

export const LandingHowItWorks: React.FC = () => (
  <section
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "24px 48px 56px",
      borderTop: "1px solid var(--clay-edge-soft)",
    }}
  >
    <div className="hud-label" style={{ marginBottom: 32, textAlign: "center" }}>
      How it works
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
      {steps.map((s) => (
        <div key={s.num}>
          <div
            className="font-display"
            style={{ fontSize: 40, fontWeight: 400, color: "var(--bio-cyan)", opacity: 0.6, lineHeight: 1, marginBottom: 12 }}
          >
            {s.num}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>{s.title}</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-mute)" }}>{s.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
