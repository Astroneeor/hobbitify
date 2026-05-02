// Shared icon set + small UI atoms

const Icon = {
  Compass: () => (
    <svg viewBox="0 0 24 24" className="icon"><circle cx="12" cy="12" r="9"/><polygon points="14 8 12 14 10 16 12 10" fill="currentColor" stroke="none"/></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M12 5v14M5 12h14"/></svg>
  ),
  Minus: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M5 12h14"/></svg>
  ),
  Frame: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M4 9V5h4M16 5h4v4M20 15v4h-4M8 19H4v-4"/></svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" className="icon"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
  ),
  Wave: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M2 12c2 0 2-3 5-3s3 6 5 6 3-9 5-9 3 6 5 6"/></svg>
  ),
  Branch: () => (
    <svg viewBox="0 0 24 24" className="icon"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8"/><path d="M12 14v2"/></svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/></svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>
  ),
  Library: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M4 5v14M9 5v14M15 6l4 13"/></svg>
  ),
  Check: () => (
    <svg viewBox="0 0 16 16" className="icon"><path d="M3 8.5l3 3 7-7" strokeWidth="2.5"/></svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M9 5H4v14h5"/><path d="M16 8l4 4-4 4"/><path d="M20 12H10"/></svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
  ),
  Up: () => (
    <svg viewBox="0 0 24 24" className="icon"><path d="M5 14l7-7 7 7"/></svg>
  ),
};

window.Icon = Icon;
