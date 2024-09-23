import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 p-4 w-full text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">My Skill Tree App</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/getting-started" className="text-white hover:text-gray-300">
              Getting Started
            </Link>
          </li>
        </ul>
      </nav>

      {/* Scrolling Text with Box */}
      <div className="relative flex flex-col justify-center items-center my-8">
        <div className="font-semibold text-2xl mb-2">I want to learn how to</div>
        <div className="relative w-48 h-12 overflow-hidden border-2 border-white rounded-lg">
          <div className="absolute animate-scroll flex flex-col items-center">
            <div className="h-12 flex items-center">start woodworking</div>
            <div className="h-12 flex items-center">play d&d</div>
            <div className="h-12 flex items-center">knit a sweater</div>
            <div className="h-12 flex items-center">spin a pen</div>
            <div className="h-12 flex items-center">carve soapstone</div>
            <div className="h-12 flex items-center">play geoguesser</div>
            <div className="h-12 flex items-center">collect insects</div>
            <div className="h-12 flex items-center">do pyrography</div>
            <div className="h-12 flex items-center">make a journal</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <Link to="/getting-started" className="btn bg-white text-black py-2 px-4 border border-white hover:bg-gray-100">
          Get Started
        </Link>
        <Link to="/learn-more" className="btn bg-black text-white py-2 px-4 border border-white hover:bg-gray-800">
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
