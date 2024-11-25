import React from 'react';

const Navbar = ({ onSearch }) => (
  <header className="App-header">
    <h1>Elanco App</h1>
    <input
      type="text"
      placeholder="Search countries..."
      onChange={(e) => onSearch(e.target.value)}
    />
  </header>
);

export default Navbar;
