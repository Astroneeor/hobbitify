import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GettingStarted from "./pages/GettingStarted";
import SkillTree from "./pages/SkillTree";

const App: React.FC = () => {
  return (
    <div className="dark bg-gray-bg text-primary-100 font-Manrope min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/skill-tree" element={<SkillTree />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
