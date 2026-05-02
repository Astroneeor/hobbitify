// Landing page — hero + features + recent biomes

const Landing = ({ onOpenTree, onOpenLibrary }) => {
  const I = window.Icon;
  return (
    <div className="landing">
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="line"></span>
            <span className="hud-label">Learning As An Adventure</span>
          </div>
          <h1 className="hero-title">
            Descend into any skill,
            <br />
            <span className="accent">one beacon</span> at a time.
          </h1>
          <p className="hero-sub">
            Hobbitify charts unfamiliar topics like an unmapped sea floor — branching paths,
            hidden currents, and a beacon waiting at every depth. Generate a tree, dive in,
            and leave a trail of unlocked nodes behind you.
          </p>
          <div className="hero-cta">
            <button className="btn btn--primary" onClick={onOpenTree}>
              <I.Sparkle /> &nbsp;Generate a tree
            </button>
            <button className="btn" onClick={onOpenLibrary}>
              <I.Library /> &nbsp;Open library
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-num">14</div>
              <div className="stat-label">Trees Charted</div>
            </div>
            <div>
              <div className="stat-num">312</div>
              <div className="stat-label">Nodes Unlocked</div>
            </div>
            <div>
              <div className="stat-num">87h</div>
              <div className="stat-label">Time Submerged</div>
            </div>
          </div>
        </div>

        <div className="scan-panel">
          <div className="scan-panel-head">
            <span>SCAN.LOG // QUANTUM_MECHANICS</span>
            <div className="dots">
              <span className="dot live"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
          <div className="sonar">
            <div className="sonar-grid"></div>
            <div className="sonar-ring"></div>
            <div className="sonar-ring"></div>
            <div className="sonar-ring"></div>
            <div className="sonar-ping"></div>

            {/* Mini connecting lines (SVG underlay) */}
            <svg className="preview-tree" viewBox="0 0 540 420" preserveAspectRatio="none">
              <defs>
                <linearGradient id="edgeGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.85 0.16 200)" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="oklch(0.65 0.18 210)" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <path d="M150 90 Q 220 160 270 200" stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3"/>
              <path d="M270 200 Q 350 250 440 320" stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3"/>
              <path d="M270 200 Q 200 280 110 340" stroke="url(#edgeGlow)" strokeWidth="1.2" fill="none" strokeDasharray="3 3"/>
              <path d="M150 90 Q 90 150 60 220" stroke="oklch(0.40 0.06 215 / 0.5)" strokeWidth="1" fill="none" strokeDasharray="2 4"/>
            </svg>

            <div className="pv-node unlocked" style={{left: '18%', top: '15%'}}>
              <span className="marker"></span> Field Foundations
            </div>
            <div className="pv-node active" style={{left: '42%', top: '40%'}}>
              <span className="marker"></span> Schrödinger Eq.
            </div>
            <div className="pv-node unlocked" style={{left: '68%', top: '70%'}}>
              <span className="marker"></span> Eigenstates
            </div>
            <div className="pv-node locked" style={{left: '8%', top: '76%'}}>
              <span className="marker"></span> Tunneling
            </div>
            <div className="pv-node locked" style={{left: '4%', top: '46%'}}>
              <span className="marker"></span> Wavefunctions
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <Feature
          tag="01"
          title="Sonar-mapped paths"
          desc="Drop a topic, get a navigable lattice of prerequisites and adjacent rabbit holes — automatically grouped by depth."
          icon={<I.Wave/>}
        />
        <Feature
          tag="02"
          title="Bioluminescent progress"
          desc="Nodes light up as you complete objectives. Pressure builds, currents shift, and your path gets clearer the deeper you go."
          icon={<I.Branch/>}
        />
        <Feature
          tag="03"
          title="Portable charts"
          desc="Save trees to your library, branch from any node, or export the whole biome as JSON for offline diving."
          icon={<I.Save/>}
        />
      </section>

      <section className="recent">
        <div className="recent-head">
          <h2>Recent biomes</h2>
          <span className="hud-tag"><span className="dot"></span> 14 charted</span>
        </div>
        <div className="biome-grid">
          <Biome cls="b1" title="Quantum Mechanics" depth="—1240m" tag="ABYSSAL · 23 NODES" fill="62"/>
          <Biome cls="b2" title="Mycology Field Guide" depth="—620m" tag="KELP FOREST · 18 NODES" fill="40" onClick={onOpenTree}/>
          <Biome cls="b3" title="Italian for Travel" depth="—340m" tag="GRASSY SHALLOWS · 12 NODES" fill="78"/>
          <Biome cls="b4" title="Bouldering V0–V4" depth="—780m" tag="LAVA ZONE · 16 NODES" fill="25"/>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ tag, title, desc, icon }) => (
  <div className="feature">
    <div className="ftag">{tag}</div>
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Biome = ({ cls, title, depth, tag, fill, onClick }) => (
  <div className="biome" onClick={onClick}>
    <div className={`biome-banner ${cls}`}>
      <div className="depth-bar">
        <div className="depth-fill" style={{width: `${fill}%`}}></div>
      </div>
      <div className="depth">{depth}</div>
    </div>
    <div className="biome-body">
      <h4>{title}</h4>
      <div className="meta">{tag}</div>
    </div>
  </div>
);

window.Landing = Landing;
