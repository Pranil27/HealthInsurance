import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>My Insurance App</span>
      </div>
      <div className="navbar-buttons">
        <button className="navbar-button">Add Policy</button>
        <button className="navbar-button">Sign Out</button>
      </div>
    </nav>
  );
};

export default Navbar;
