// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GettingStarted from './pages/GettingStarted';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/getting-started" element={<GettingStarted />} />
      </Routes>
    </Router>
  );
};

export default App;
