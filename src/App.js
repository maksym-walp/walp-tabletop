import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import SpellList from './components/SpellList';
import SpellDetail from './components/SpellDetail';
import SpellForm from './components/SpellForm';
import Traditions from './components/Traditions';
import './App.css';

function App() {
  const [spells, setSpells] = useState([]);
  const [filteredSpells, setFilteredSpells] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/spells`)
      .then(res => res.json())
      .then(data => {
        setSpells(data);
        setFilteredSpells(data);
      })
      .catch(err => console.error("Failed to fetch spells:", err));
  }, []);

  const handleFilterChange = (filters) => {
    let tempSpells = [...spells];
    if (filters.name) {
      tempSpells = tempSpells.filter(spell => spell.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.levels.length > 0) {
      tempSpells = tempSpells.filter(spell => filters.levels.includes(spell.level.toString()));
    }
    if (filters.traditions.length > 0) {
        tempSpells = tempSpells.filter(spell => 
            spell.traditions.some(tradition => filters.traditions.includes(tradition))
        );
    }
    setFilteredSpells(tempSpells);
  };

  const handleSpellAdded = (newSpell) => {
    const updatedSpells = [...spells, newSpell];
    setSpells(updatedSpells);
    setFilteredSpells(updatedSpells); // Or re-apply filters
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Spell Book</h1>
          <nav>
            <Link to="/">Заклинання</Link>
            <Link to="/traditions">Про арканічні традиції</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={
            <main>
              <SpellList 
                spells={filteredSpells} 
                onFilterChange={handleFilterChange}
              />
              <Link to="/add-spell" className="add-spell-button">+</Link>
            </main>
          } />
          <Route path="/spells/:id" element={<SpellDetail />} />
          <Route path="/add-spell" element={<SpellForm onSpellAdded={handleSpellAdded} />} />
          <Route path="/traditions" element={<Traditions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
