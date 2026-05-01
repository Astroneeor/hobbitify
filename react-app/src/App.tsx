import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import GettingStarted from "./pages/GettingStarted";
import SkillTree from "./pages/SkillTree";
import Library from "./pages/Library";
import Upload from "./pages/Upload";

const App: React.FC = () => {
  return (
    <div className="dark bg-bg-primary text-text-primary font-Manrope min-h-screen">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
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
  );
};

export default App;
