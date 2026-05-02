import React from "react";

const BIOMES = [
  { cls: "biome-banner--cyan",   title: "Quantum Mechanics",    depth: "—1240m", tag: "ABYSSAL · 23 NODES",           fill: 62 },
  { cls: "biome-banner--kelp",   title: "Mycology Field Guide", depth: "—620m",  tag: "KELP FOREST · 18 NODES",       fill: 40 },
  { cls: "biome-banner--amber",  title: "Italian for Travel",   depth: "—340m",  tag: "GRASSY SHALLOWS · 12 NODES",   fill: 78 },
  { cls: "biome-banner--coral",  title: "Bouldering V0–V4",     depth: "—780m",  tag: "LAVA ZONE · 16 NODES",         fill: 25 },
];

export const LandingDemoStrip: React.FC = () => (
  <section
    style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "16px 48px 72px",
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
      <h2 className="font-display" style={{ fontSize: 26, fontWeight: 400, color: "var(--ink)" }}>
        Recent biomes
      </h2>
      <div className="hud-tag">
        <span className="dot" />
        sample charts
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {BIOMES.map((b) => (
        <div key={b.title} className="biome-card">
          <div className={`biome-banner ${b.cls}`}>
            <div className="biome-depth-bar">
              <div className="biome-depth-fill" style={{ width: `${b.fill}%` }} />
            </div>
            <div className="biome-depth-label">{b.depth}</div>
          </div>
          <div style={{ padding: "12px 16px 16px" }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{b.title}</h4>
            <div className="font-mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: "1px" }}>{b.tag}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
