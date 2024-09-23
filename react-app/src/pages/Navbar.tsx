import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-bg fixed top-0 w-full z-30 shadow-md">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo or Title */}
        <h1 className="text-primary-100 font-bold text-2xl">Skill Tree App</h1>

        {/* Navigation Links */}
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/"
              className="text-primary-100 hover:text-primary-200 transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/getting-started"
              className="text-primary-100 hover:text-primary-200 transition-colors duration-300"
            >
              Getting Started
            </Link>
          </li>
          <li>
            <Link
              to="/skill-tree"
              className="text-primary-100 hover:text-primary-200 transition-colors duration-300"
            >
              Skill Tree
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
