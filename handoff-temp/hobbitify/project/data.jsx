// Skill tree data — Quantum Mechanics fundamentals
// Layout: x,y in canvas pixels. Tier indicates progression depth.

const TREE_DATA = {
  title: "Quantum Mechanics",
  subtitle: "An ocean of probability — descend at your own depth.",
  totalDepth: 1240,
  nodes: [
    // Root tier — biome surface
    { id: 'qf',  x: 480, y: 60,  tier: 'ROOT • 0M', state: 'unlocked', progress: 100,
      title: 'Quantum Field Foundations',
      desc: 'Calibrate intuition for wave-particle duality and probability amplitudes.',
      stats: { time: '4h 20m', xp: 240, depth: '0–60m', objectives: '5/5' },
      objectives: [
        { text: 'Read Feynman Vol III, Ch 1–3', done: true },
        { text: 'Watch MIT 8.04 lecture 1', done: true },
        { text: 'Quiz: probability axioms', done: true },
        { text: 'Sketch the double-slit setup', done: true },
        { text: 'Write 200-word reflection', done: true }
      ]
    },
    { id: 'mc',  x: 980, y: 60,  tier: 'ROOT • 0M', state: 'active', progress: 62,
      title: 'Mathematical Currents',
      desc: 'Linear algebra, complex numbers, and Hilbert spaces as your dive gear.',
      stats: { time: '3h 10m', xp: 180, depth: '0–80m', objectives: '3/5' },
      objectives: [
        { text: 'Complex number warmups', done: true },
        { text: 'Vector spaces & inner products', done: true },
        { text: 'Eigenvalue problem set', done: true },
        { text: 'Hermitian operators essay', done: false },
        { text: 'Bra-ket notation drill', done: false }
      ]
    },

    // Tier 1
    { id: 'sup', x: 220, y: 280, tier: 'TIER I • 120M', state: 'unlocked', progress: 100,
      title: 'Superposition Principle',
      desc: 'States that coexist until observation collapses the wave.',
      stats: { time: '2h 40m', xp: 160, depth: '120m', objectives: '4/4' }
    },
    { id: 'sch', x: 480, y: 280, tier: 'TIER I • 140M', state: 'active', progress: 45,
      title: 'Schrödinger Equation',
      desc: 'The dynamic law governing how quantum states evolve over time.',
      stats: { time: '5h 30m', xp: 280, depth: '140m', objectives: '2/5' },
      objectives: [
        { text: 'Derive time-dependent form', done: true },
        { text: 'Solve free particle case', done: true },
        { text: 'Infinite well problem', done: false },
        { text: 'Harmonic oscillator', done: false },
        { text: 'Hydrogen atom warmup', done: false }
      ]
    },
    { id: 'unc', x: 740, y: 280, tier: 'TIER I • 160M', state: 'unlocked', progress: 100,
      title: 'Uncertainty Principle',
      desc: 'Fundamental limits on simultaneous knowledge of conjugate variables.',
      stats: { time: '2h 10m', xp: 140, depth: '160m', objectives: '3/3' }
    },
    { id: 'lin', x: 1000, y: 280, tier: 'TIER I • 180M', state: 'unlocked', progress: 100,
      title: 'Linear Operators',
      desc: 'Hermitian, unitary, projection — the verbs of quantum mechanics.',
      stats: { time: '3h 50m', xp: 200, depth: '180m', objectives: '4/4' }
    },

    // Tier 2
    { id: 'wav', x:  60, y: 520, tier: 'TIER II • 320M', state: 'locked', progress: 0,
      title: 'Wavefunction Analysis',
      desc: 'Probability densities, normalization, and observable expectations.',
      stats: { time: '~4h', xp: 220, depth: '320m', objectives: '0/4' }
    },
    { id: 'dbr', x: 280, y: 520, tier: 'TIER II • 340M', state: 'unlocked', progress: 100,
      title: 'de Broglie Waves',
      desc: 'Matter waves and the wave-particle bridge across all scales.',
      stats: { time: '1h 50m', xp: 110, depth: '340m', objectives: '3/3' }
    },
    { id: 'mom', x: 500, y: 520, tier: 'TIER II • 360M', state: 'active', progress: 30,
      title: 'Momentum Operators',
      desc: 'Differential operators acting on position-space wavefunctions.',
      stats: { time: '3h 20m', xp: 170, depth: '360m', objectives: '1/4' }
    },
    { id: 'hms', x: 720, y: 520, tier: 'TIER II • 380M', state: 'locked', progress: 0,
      title: 'Hilbert Space Tour',
      desc: 'Inner-product spaces, completeness, and the geometry of states.',
      stats: { time: '~5h', xp: 260, depth: '380m', objectives: '0/5' }
    },
    { id: 'eig', x: 940, y: 520, tier: 'TIER II • 400M', state: 'active', progress: 55,
      title: 'Eigenstate Analysis',
      desc: 'Decomposing arbitrary states into operator eigenbases.',
      stats: { time: '4h 10m', xp: 210, depth: '400m', objectives: '3/5' }
    },

    // Tier 3
    { id: 'tng', x: 100, y: 760, tier: 'TIER III • 540M', state: 'active', progress: 18,
      title: 'Quantum Tunneling',
      desc: 'Barrier penetration and exponential decay of wavefunctions.',
      stats: { time: '5h 50m', xp: 290, depth: '540m', objectives: '1/5' }
    },
    { id: 'spn', x: 320, y: 760, tier: 'TIER III • 560M', state: 'locked', progress: 0,
      title: 'Spin & Pauli Matrices',
      desc: 'Intrinsic angular momentum without classical analog.',
      stats: { time: '~4h', xp: 230, depth: '560m', objectives: '0/4' }
    },
    { id: 'ang', x: 540, y: 760, tier: 'TIER III • 580M', state: 'locked', progress: 0,
      title: 'Angular Momentum',
      desc: 'Commutation relations and the ladder operator algebra.',
      stats: { time: '~6h', xp: 320, depth: '580m', objectives: '0/6' }
    },
    { id: 'pth', x: 760, y: 760, tier: 'TIER III • 600M', state: 'locked', progress: 0,
      title: 'Path Integrals',
      desc: 'Sum over histories — Feynman’s reformulation of quantum dynamics.',
      stats: { time: '~7h', xp: 380, depth: '600m', objectives: '0/6' }
    },
    { id: 'msm', x: 980, y: 760, tier: 'TIER III • 620M', state: 'locked', progress: 0,
      title: 'Measurement Theory',
      desc: 'Born rule, projective measurements, and the collapse postulate.',
      stats: { time: '~5h', xp: 280, depth: '620m', objectives: '0/5' }
    },

    // Tier 4 — abyss
    { id: 'ent', x: 240, y: 1000, tier: 'TIER IV • 820M', state: 'locked', progress: 0,
      title: 'Entanglement & Bell',
      desc: 'Non-classical correlations and the violation of local realism.',
      stats: { time: '~6h', xp: 360, depth: '820m', objectives: '0/6' }
    },
    { id: 'dec', x: 500, y: 1000, tier: 'TIER IV • 840M', state: 'locked', progress: 0,
      title: 'Decoherence',
      desc: 'How quantum systems lose phase information through environment coupling.',
      stats: { time: '~5h', xp: 300, depth: '840m', objectives: '0/5' }
    },
    { id: 'qft', x: 760, y: 1000, tier: 'TIER IV • 880M', state: 'locked', progress: 0,
      title: 'Field Theory Primer',
      desc: 'Second quantization and the relativistic generalization.',
      stats: { time: '~8h', xp: 480, depth: '880m', objectives: '0/8' }
    },
  ],

  // Edges connect parent → child
  edges: [
    ['qf','sup'], ['qf','sch'], ['mc','sch'], ['mc','unc'], ['mc','lin'],
    ['sup','wav'], ['sup','dbr'], ['sch','dbr'], ['sch','mom'], ['unc','mom'],
    ['unc','hms'], ['lin','hms'], ['lin','eig'],
    ['wav','tng'], ['dbr','tng'], ['dbr','spn'], ['mom','spn'], ['mom','ang'],
    ['hms','ang'], ['hms','pth'], ['eig','pth'], ['eig','msm'],
    ['spn','ent'], ['ang','ent'], ['ang','dec'], ['pth','dec'], ['pth','qft'], ['msm','qft']
  ]
};

window.TREE_DATA = TREE_DATA;
