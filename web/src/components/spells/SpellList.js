
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpellCard from './SpellCard';
import spellConfig from '../../config/spellConfig.json';
import './SpellList.css';

const SpellList = ({ spells }) => {
  const [filters, setFilters] = useState({
    name: '',
    level: '',
    traditions: [],
    concentration: false,
    ritual: false
  });

  const [isFiltersVisible, setIsFiltersVisible] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsFiltersVisible(false);
      } else {
        setIsFiltersVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Set initial state based on screen size
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSpells = useMemo(() => {
    return spells.filter(spell => {
      // Filter by name
      if (filters.name && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }

      // Filter by level
      if (filters.level !== '' && spell.level !== parseInt(filters.level)) {
        return false;
      }

      // Filter by traditions
      if (filters.traditions.length > 0 && !filters.traditions.some(t => spell.traditions.includes(t))) {
        return false;
      }

      // Filter by concentration
      if (filters.concentration && !spell.concentration) {
        return false;
      }

      // Filter by ritual
      if (filters.ritual && !spell.ritual) {
        return false;
      }

      return true;
    });
  }, [spells, filters]);

  const handleTraditionChange = (tradition) => {
    setFilters(prev => {
      const newTraditions = prev.traditions.includes(tradition)
        ? prev.traditions.filter(t => t !== tradition)
        : [...prev.traditions, tradition];
      return { ...prev, traditions: newTraditions };
    });
  };

  return (
    <div className="spell-list-container">
      <div className={`filters ${isFiltersVisible ? 'visible' : ''}`}>
        <div className="filters-header" onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
          <h3>Фільтри</h3>
          <button className="toggle-filters-btn">
            {isFiltersVisible ? 'Згорнути' : 'Розгорнути'}
          </button>
        </div>
        <div className="filters-content">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Пошук за назвою..."
              value={filters.name}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="name-filter"
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="level-filter"
            >
              <option value="">Всі рівні</option>
              {[...Array(spellConfig.spellLevels.max + 1)].map((_, i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="filter-group traditions">
            <label>Арканічні традиції:</label>
            <div className="traditions-list">
              {spellConfig.traditions.map(tradition => (
                <label key={tradition} className="tradition-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.traditions.includes(tradition)}
                    onChange={() => handleTraditionChange(tradition)}
                  />
                  <span>{tradition}</span>
                </label>
              ))}
            </div>
            <Link to="/traditions" className="traditions-link">
              Дізнатись більше про арканічні традиції
            </Link>
          </div>

          <div className="filter-group flags">
            {spellConfig.flags.map(flag => (
              <label key={flag.name} className="flag-checkbox">
                <input
                  type="checkbox"
                  checked={filters[flag.name]}
                  onChange={() => setFilters(prev => ({ ...prev, [flag.name]: !prev[flag.name] }))}
                />
                <span>{flag.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="spell-list">
        {filteredSpells.map(spell => (
          <SpellCard key={spell.id} spell={spell} />
        ))}
      </div>
    </div>
  );
};

export default SpellList;
