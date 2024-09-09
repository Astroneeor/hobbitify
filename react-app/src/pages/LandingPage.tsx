// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">My Skill Tree App</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/getting-started" className="text-white hover:text-gray-300">
              Getting Started
            </Link>
          </li>
        </ul>
      </nav>

      {/* Scrolling Text */}
      <div className="flex-grow flex justify-center items-center">
        <div className="border-2 border-black px-6 py-4 text-lg font-semibold whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-marquee">
            Welcome to the Skill Tree Generator! Let's get started by selecting your hobbies and skills!
          </div>
        </div>
      </div>

      {/* Footer (optional) */}
    </div>
  );
};

export default LandingPage;
