import React from 'react';
import Navbar from '../Navbar/Navbar.jsx';
import './Layout.css'; // Make sure to create this CSS file for styling

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
