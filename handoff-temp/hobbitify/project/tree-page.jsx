// Skill tree page — pan/zoom canvas, nodes, edges, detail panel

const NODE_W = 200;
const NODE_H = 132;

const TreePage = ({ onBack }) => {
  const I = window.Icon;
  const data = window.TREE_DATA;
  const canvasRef = React.useRef(null);

  const [transform, setTransform] = React.useState({ x: -200, y: 0, k: 0.78 });
  const [drag, setDrag] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('tree');

  // Pan
  const onMouseDown = (e) => {
    if (e.target.closest('.node') || e.target.closest('.detail-panel')) return;
    setDrag({ sx: e.clientX, sy: e.clientY, ox: transform.x, oy: transform.y });
  };
  const onMouseMove = (e) => {
    if (!drag) return;
    setTransform(t => ({ ...t, x: drag.ox + (e.clientX - drag.sx), y: drag.oy + (e.clientY - drag.sy) }));
  };
  const onMouseUp = () => setDrag(null);

  // Zoom
  const onWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.0015;
    const newK = Math.min(1.6, Math.max(0.3, transform.k * (1 + delta)));
    const ratio = newK / transform.k;
    setTransform({
      k: newK,
      x: mx - (mx - transform.x) * ratio,
      y: my - (my - transform.y) * ratio,
    });
  };

  const setZoom = (newK) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const ratio = newK / transform.k;
    setTransform({
      k: newK,
      x: cx - (cx - transform.x) * ratio,
      y: cy - (cy - transform.y) * ratio,
    });
  };

  const fitAll = () => setTransform({ x: -180, y: 0, k: 0.7 });

  const totalDone = data.nodes.filter(n => n.state === 'unlocked').length;
  const totalCount = data.nodes.length;
  const pct = Math.round((totalDone / totalCount) * 100);

  const tierColor = (state) => ({
    unlocked: 'oklch(0.65 0.18 210)',
    active: 'oklch(0.78 0.16 75)',
    locked: 'oklch(0.40 0.06 220)',
  }[state] || 'oklch(0.40 0.06 220)');

  // Build edge paths
  const nodeMap = Object.fromEntries(data.nodes.map(n => [n.id, n]));
  const edgePaths = data.edges.map(([a, b], i) => {
    const A = nodeMap[a], B = nodeMap[b];
    if (!A || !B) return null;
    const x1 = A.x + NODE_W / 2;
    const y1 = A.y + NODE_H;
    const x2 = B.x + NODE_W / 2;
    const y2 = B.y;
    const midY = (y1 + y2) / 2;
    const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    const lit = (A.state === 'unlocked' || A.state === 'active');
    return (
      <path key={i} d={path}
        stroke={lit ? 'oklch(0.65 0.18 210)' : 'oklch(0.32 0.05 220)'}
        strokeWidth={lit ? 1.5 : 1}
        strokeOpacity={lit ? 0.7 : 0.4}
        strokeDasharray={lit ? '0' : '3 5'}
        fill="none"
        style={{ filter: lit ? 'drop-shadow(0 0 4px oklch(0.65 0.18 210 / 0.6))' : 'none' }}
      />
    );
  });

  // Compute canvas extent for SVG
  const maxX = Math.max(...data.nodes.map(n => n.x)) + NODE_W + 200;
  const maxY = Math.max(...data.nodes.map(n => n.y)) + NODE_H + 200;

  const sel = selected ? nodeMap[selected] : null;

  // Mini-map
  const mmW = 200, mmH = 106;
  const scaleX = mmW / maxX;
  const scaleY = mmH / maxY;
  const mmScale = Math.min(scaleX, scaleY);

  return (
    <div className="tree-page">
      <div className="tree-toolbar">
        <div className="tree-toolbar-left">
          <button className="btn btn--ghost" onClick={onBack}>← Surface</button>
          <div className="depth-meter">
            <span className="dlabel">DEPTH</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <span className="dval">{totalDone}/{totalCount}</span>
          </div>
          <span className="hud-tag title-tag"><span className="dot"></span> {data.title}</span>
        </div>
        <div className="tree-toolbar-right">
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setZoom(Math.max(0.3, transform.k - 0.1))} title="Zoom out"><I.Minus/></button>
            <div className="zoom-pct">{Math.round(transform.k * 100)}%</div>
            <button className="zoom-btn" onClick={() => setZoom(Math.min(1.6, transform.k + 0.1))} title="Zoom in"><I.Plus/></button>
            <button className="zoom-btn" onClick={fitAll} title="Fit"><I.Frame/></button>
          </div>
          <button className="btn">Load</button>
          <button className="btn">Export</button>
          <button className="btn btn--primary"><I.Sparkle/>&nbsp;New</button>
          <button className="btn btn--danger"><I.Trash/></button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className={`tree-canvas ${drag ? 'dragging' : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <div className="canvas-grid"></div>

        <div
          className="tree-stage"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
        >
          <svg className="edges" width={maxX} height={maxY} style={{ left: 0, top: 0 }}>
            {edgePaths}
          </svg>

          {data.nodes.map((n, i) => {
            const cls = `node node--${n.state === 'unlocked' && i < 2 ? 'root' : n.state} ${selected === n.id ? 'node--selected' : ''}`;
            return (
              <div
                key={n.id}
                className={cls}
                style={{ left: n.x, top: n.y }}
                onClick={(e) => { e.stopPropagation(); setSelected(n.id); }}
              >
                <div className="node-head">
                  <span className="node-tier">{n.tier}</span>
                  <span className="node-icon">
                    {n.state === 'locked' ? <I.Lock/> : n.state === 'active' ? <I.Sparkle/> : <I.Check/>}
                  </span>
                </div>
                <h4>{n.title}</h4>
                <p>{n.desc}</p>
                <div className="node-foot">
                  <span className="node-pill">
                    {n.state === 'locked' ? 'LOCKED' : n.state === 'active' ? `${n.progress}%` : 'CLEARED'}
                  </span>
                  <div className="node-prog">
                    <div className="node-prog-fill" style={{ width: `${n.progress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="canvas-vignette"></div>

        {sel && <DetailPanel node={sel} onClose={() => setSelected(null)} />}

        <div className="minimap">
          <div className="minimap-head">
            <span>BIOME MAP</span>
            <span>—{data.totalDepth}m</span>
          </div>
          <div className="minimap-body">
            {data.nodes.map(n => (
              <div key={n.id}
                className="minimap-node"
                style={{
                  left: n.x * mmScale,
                  top: n.y * mmScale,
                  width: NODE_W * mmScale,
                  height: NODE_H * mmScale,
                  background: tierColor(n.state),
                  opacity: n.state === 'locked' ? 0.45 : 0.9,
                  boxShadow: n.state !== 'locked' ? `0 0 4px ${tierColor(n.state)}` : 'none',
                }}
              />
            ))}
            {/* Viewport rect */}
            <div className="minimap-viewport" style={{
              left: Math.max(0, -transform.x / transform.k * mmScale),
              top: Math.max(0, -transform.y / transform.k * mmScale),
              width: Math.min(mmW, (canvasRef.current?.clientWidth || 800) / transform.k * mmScale),
              height: Math.min(mmH - 24, (canvasRef.current?.clientHeight || 600) / transform.k * mmScale),
            }}/>
          </div>
        </div>

        <div className="tree-help">
          <span><kbd>DRAG</kbd> pan biome</span>
          <span><kbd>SCROLL</kbd> adjust depth</span>
          <span><kbd>CLICK</kbd> scan node</span>
        </div>
      </div>
    </div>
  );
};

const DetailPanel = ({ node, onClose }) => {
  const I = window.Icon;
  const objectives = node.objectives || [
    { text: 'Locate primary research source', done: node.progress >= 25 },
    { text: 'Complete first concept set', done: node.progress >= 50 },
    { text: 'Practice problems 1–10', done: node.progress >= 75 },
    { text: 'Reflection journal entry', done: node.progress >= 100 },
  ];
  return (
    <div className="detail-panel">
      <div className="detail-head">
        <span className="htag">◉ NODE.SCAN // {node.tier}</span>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="detail-body">
        <h3>{node.title}</h3>
        <p className="desc">{node.desc}</p>

        <div className="detail-stats">
          <div className="dstat"><div className="dlbl">EST. TIME</div><div className="dnum">{node.stats?.time || '—'}</div></div>
          <div className="dstat"><div className="dlbl">XP REWARD</div><div className="dnum">{node.stats?.xp || '—'}</div></div>
          <div className="dstat"><div className="dlbl">DEPTH</div><div className="dnum">{node.stats?.depth || '—'}</div></div>
          <div className="dstat"><div className="dlbl">OBJECTIVES</div><div className="dnum">{node.stats?.objectives || '—'}</div></div>
        </div>

        <ul className="detail-objectives">
          {objectives.map((o, i) => (
            <li key={i} className={o.done ? 'done' : ''}>
              <span className="check">{o.done && <I.Check/>}</span>
              <span>{o.text}</span>
            </li>
          ))}
        </ul>

        <div className="detail-actions">
          {node.state === 'locked'
            ? <button className="btn" disabled style={{opacity:0.6}}>◌ Sealed by current</button>
            : <>
                <button className="btn btn--primary">{node.state === 'active' ? 'Resume dive' : 'Re-scan'}</button>
                <button className="btn">Branch</button>
              </>
          }
        </div>
      </div>
    </div>
  );
};

window.TreePage = TreePage;
