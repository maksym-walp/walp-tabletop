import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import ComingSoon from './pages/ComingSoon';
import SpellList from './components/spells/SpellList';
import SpellDetail from './components/spells/SpellDetail';
import SpellForm from './components/spells/SpellForm';
import Traditions from './components/spells/Traditions';
import './App.css';

function SpellsPage({ spells }) {
  return (
    <main className="spells-page">
      <SpellList spells={spells} />
      <Link to="/spells/add" className="add-spell-button">+</Link>
    </main>
  );
}

function AppContent() {
  const [spells, setSpells] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_BASE_URL}/spells`)
      .then(res => res.json())
      .then(data => {
        setSpells(data);
      })
      .catch(err => console.error("Failed to fetch spells:", err));
  }, [API_BASE_URL]);

  const handleSpellAdded = (newSpell) => {
    setSpells(prev => [...prev, newSpell]);
  };

  const showHeader = location.pathname !== '/';

  return (
    <div className="App">
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spells" element={<SpellsPage spells={spells} />} />
        <Route path="/spells/:id" element={<SpellDetail />} />
        <Route path="/spells/add" element={<SpellForm onSpellAdded={handleSpellAdded} />} />
        <Route path="/traditions" element={<Traditions />} />
        <Route path="/bestiary" element={<ComingSoon />} />
        <Route path="/atlas" element={<ComingSoon />} />
        <Route path="/characters" element={<ComingSoon />} />
        <Route path="/profile" element={<ComingSoon />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
