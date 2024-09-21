// src/components/Navbar.tsx
import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav style={navbarStyles}>
      <div className={`${flexBetween} fixed top-0 z-30 py-6`}></div>
    </nav>
  );
};

const navbarStyles: React.CSSProperties = {
  backgroundColor: "#333",
  padding: "10px",
  position: "fixed",
  top: 0,
  width: "100%",
};

const ulStyles: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  justifyContent: "center",
};

export default Navbar;
