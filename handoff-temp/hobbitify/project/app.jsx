// App shell — chrome + page switcher + tweaks

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentHue": 200,
  "particleDensity": 30,
  "showCaustics": true,
  "showMinimap": true,
  "showSonar": true,
  "claymorphism": 1
}/*EDITMODE-END*/;

const App = () => {
  const I = window.Icon;
  const [page, setPage] = React.useState('landing');
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAKS_DEFAULTS)
    : [TWEAKS_DEFAULTS, () => {}];

  // Apply tweaks via CSS vars
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--bio-cyan', `oklch(0.85 0.16 ${tweaks.accentHue})`);
    r.style.setProperty('--bio-cyan-deep', `oklch(0.65 0.18 ${tweaks.accentHue + 10})`);
  }, [tweaks.accentHue]);

  // Particles
  const particles = React.useMemo(() => {
    const n = Math.round(tweaks.particleDensity);
    return Array.from({ length: n }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 20,
      dur: 12 + Math.random() * 18,
      size: 1 + Math.random() * 2,
    }));
  }, [tweaks.particleDensity]);

  return (
    <>
      <div className="ocean"></div>
      {tweaks.showCaustics && <div className="caustics"></div>}
      <div className="particles">
        {particles.map((p, i) => (
          <div key={i} className="particle" style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}/>
        ))}
      </div>

      <div className="chrome">
        <div className="brand" onClick={() => setPage('landing')} style={{cursor: 'pointer'}}>
          <span className="glyph"></span>
          <span>hobbitify</span>
        </div>
        <div className="nav-actions">
          {page === 'landing' && <>
            <button className="btn btn--ghost" onClick={() => setPage('tree')}>Library</button>
            <button className="btn btn--ghost"><I.Logout/>&nbsp;Log out</button>
            <button className="btn btn--primary" onClick={() => setPage('tree')}><I.Sparkle/>&nbsp;Generate</button>
          </>}
          {page === 'tree' && <>
            <button className="btn btn--ghost" onClick={() => setPage('landing')}>← Surface</button>
            <button className="btn btn--ghost"><I.Logout/>&nbsp;Log out</button>
          </>}
        </div>
      </div>

      {page === 'landing' && <Landing onOpenTree={() => setPage('tree')} onOpenLibrary={() => setPage('tree')} />}
      {page === 'tree' && <TreePage onBack={() => setPage('landing')} />}

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Atmosphere">
            <window.TweakSlider label="Accent hue" value={tweaks.accentHue} min={140} max={300} step={1}
              onChange={(v) => setTweak('accentHue', v)} suffix="°" />
            <window.TweakSlider label="Particle density" value={tweaks.particleDensity} min={0} max={80} step={1}
              onChange={(v) => setTweak('particleDensity', v)} />
            <window.TweakToggle label="Caustic light" value={tweaks.showCaustics}
              onChange={(v) => setTweak('showCaustics', v)} />
          </window.TweakSection>
          <window.TweakSection title="Tree HUD">
            <window.TweakToggle label="Mini-map" value={tweaks.showMinimap}
              onChange={(v) => setTweak('showMinimap', v)} />
            <window.TweakToggle label="Sonar preview" value={tweaks.showSonar}
              onChange={(v) => setTweak('showSonar', v)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
