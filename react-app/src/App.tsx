import React, { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GettingStarted from "./pages/GettingStarted";
import SkillTree from "./pages/SkillTree";
import Library from "./pages/Library";
import Upload from "./pages/Upload";

/** Floating bioluminescent particles that drift upward through the ocean. */
const Particles: React.FC = () => {
  const items = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        left:  Math.sin(i * 47.3) * 50 + 50,
        delay: (i * 0.73) % 20,
        dur:   12 + ((i * 1.61) % 18),
        size:  1 + ((i * 0.41) % 2),
      })),
    [],
  );

  return (
    <div className="particles" aria-hidden>
      {items.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left:              `${p.left}%`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width:             `${p.size}px`,
            height:            `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="dark bg-bg-primary text-text-primary font-Manrope min-h-screen" style={{ position: "relative" }}>
      {/* Subnautica atmosphere — fixed, behind all content */}
      <div className="ocean"   aria-hidden />
      <div className="caustics" aria-hidden />
      <Particles />

      {/* App content — sits above atmosphere */}
      <div style={{ position: "relative", zIndex: 5 }}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/getting-started"
                element={
                  <RequireAuth>
                    <GettingStarted />
                  </RequireAuth>
                }
              />
              <Route path="/skill-tree" element={<SkillTree />} />
              <Route
                path="/library"
                element={
                  <RequireAuth>
                    <Library />
                  </RequireAuth>
                }
              />
              <Route
                path="/upload"
                element={
                  <RequireAuth>
                    <Upload />
                  </RequireAuth>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </div>
    </div>
  );
};

export default App;
