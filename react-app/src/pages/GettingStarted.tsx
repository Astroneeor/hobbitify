// src/pages/GettingStarted.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GettingStarted: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    localStorage.setItem('hobby', inputValue);
    alert('Hobby saved in localStorage!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">My Skill Tree App</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-white hover:text-gray-300">
              Home
            </Link>
          </li>
        </ul>
      </nav>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <input
          type="text"
          placeholder="Enter your hobby"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border p-2 rounded mb-4"
        />
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default GettingStarted;
