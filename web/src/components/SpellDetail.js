import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import spellConfig from '../config/spellConfig.json';
import './SpellDetail.css';

const SpellDetail = () => {
  const [spell, setSpell] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { id } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

  useEffect(() => {
    fetch(`${API_BASE_URL}/spells/${id}`)
      .then(res => res.json())
      .then(data => {
        setSpell(data);
        setSelectedLevel(data.level);
      })
      .catch(err => console.error("Failed to fetch spell details:", err));
  }, [id]);

  if (!spell) {
    return <div className="loading">Завантаження...</div>;
  }

  const getDurationText = (duration) => {
    if (duration.unit === 'moment') return 'Мить';
    const unit = spellConfig.durationUnits.find(u => u.value === duration.unit);
    if (!unit) return 'Невідомо';
    
    if (!unit.requiresValue) return unit.label;
    if (duration.unit === 'custom') return `${duration.value} ${duration.customUnit}`;
    return `${duration.value} ${unit.label.toLowerCase()}`;
  };

  const availableLevels = [spell.level];
  if (spell.hasHigherLevels) {
    Object.keys(spell.higherLevels).forEach(level => {
      availableLevels.push(parseInt(level));
    });
  }
  availableLevels.sort((a, b) => a - b);

  const getCurrentDescription = () => {
    if (selectedLevel === spell.level) {
      return {
        narrative: spell.narrativeDescription,
        mechanical: spell.mechanicalDescription
      };
    }
    return spell.higherLevels[selectedLevel] || {
      narrative: 'Немає опису для цього рівня',
      mechanical: 'Немає опису для цього рівня'
    };
  };

  const description = getCurrentDescription();

  return (
    <div className="spell-detail-container">
      <h1>{spell.name}</h1>
      <div className="spell-meta">
        <span><strong>Рівень:</strong> {spell.level}</span>
        <span><strong>Арканічні традиції:</strong> {spell.traditions.join(', ')}</span>
      </div>
      <div className="spell-properties">
        <p><strong>💠 Кількість дій:</strong> {spell.actions}</p>
        <p><strong>🚶 Відстань:</strong> {spell.range} {spellConfig.range.units}</p>
        <p><strong>⌛ Тривалість:</strong> {getDurationText(spell.duration)}</p>
        <p><strong>Компоненти:</strong> {spell.components.join(', ')}</p>
        <div className="spell-flags">
          <strong>Особливості:</strong>
          {spellConfig.flags.map(flag => (
            spell[flag.name] && (
              <span key={flag.name} className="flag">
                {flag.label}
              </span>
            )
          ))}
          {!spellConfig.flags.some(flag => spell[flag.name]) && (
            <span>Без особливостей</span>
          )}
        </div>
      </div>

      {availableLevels.length > 1 && (
        <div className="level-tabs">
          {availableLevels.map(level => (
            <button
              key={level}
              className={`level-tab ${selectedLevel === level ? 'active' : ''}`}
              onClick={() => setSelectedLevel(level)}
            >
              {level} рівень
            </button>
          ))}
        </div>
      )}

      <div className="spell-description-full">
        <div className="description-section">
          <h3>Наративний опис</h3>
          <p>{description.narrative}</p>
        </div>
        
        <div className="description-section">
          <h3>Механічний опис</h3>
          <p>{description.mechanical}</p>
        </div>
      </div>
    </div>
  );
};

export default SpellDetail;
