import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpellForm.css';
import spellConfig from '../config/spellConfig.json';

const SpellForm = ({ onSpellAdded }) => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  
  const [spell, setSpell] = useState({
    name: '',
    level: spellConfig.spellLevels.min,
    traditions: [],
    actions: spellConfig.actions.min,
    range: spellConfig.range.min,
    concentration: false,
    ritual: false,
    components: spellConfig.defaultComponents,
    duration: {
      value: 0,
      unit: spellConfig.durationUnits[0].value,
      customUnit: ''
    },
    narrativeDescription: '',
    mechanicalDescription: '',
    hasHigherLevels: false,
    higherLevels: {}
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSpell(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTraditionChange = (e) => {
    const { value, checked } = e.target;
    setSpell(prev => {
      const traditions = checked
        ? [...prev.traditions, value]
        : prev.traditions.filter(t => t !== value);
      return { ...prev, traditions };
    });
  };

  const handleComponentChange = (index, value) => {
    const newComponents = [...spell.components];
    newComponents[index] = value;
    setSpell(prev => ({ ...prev, components: newComponents }));
  };

  const addComponent = () => {
    setSpell(prev => ({ ...prev, components: [...prev.components, ''] }));
  };

  const removeComponent = (index) => {
    const newComponents = spell.components.filter((_, i) => i !== index);
    setSpell(prev => ({ ...prev, components: newComponents }));
  };

  const handleLevelEffects = (level) => {
    if (!spell.higherLevels[level]) {
      setSpell(prev => ({
        ...prev,
        higherLevels: {
          ...prev.higherLevels,
          [level]: { narrative: '', mechanical: '' }
        }
      }));
    }
  };

  const handleHigherLevelChange = (level, field, value) => {
    setSpell(prev => ({
      ...prev,
      higherLevels: {
        ...prev.higherLevels,
        [level]: {
          ...prev.higherLevels[level],
          [field]: value
        }
      }
    }));
  };

  const removeLevelEffects = (level) => {
    setSpell(prev => {
      const newHigherLevels = { ...prev.higherLevels };
      delete newHigherLevels[level];
      return { ...prev, higherLevels: newHigherLevels };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const spellToSubmit = {
      ...spell,
      level: parseInt(spell.level, 10),
      actions: parseInt(spell.actions, 10),
      range: parseInt(spell.range, 10),
      duration: {
        ...spell.duration,
        value: spell.duration.unit === 'until_short_rest' || spell.duration.unit === 'until_long_rest' 
          ? 0 
          : parseInt(spell.duration.value, 10)
      }
    };

    fetch(`${API_BASE_URL}/spells`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spellToSubmit),
    })
    .then(res => res.json())
    .then(data => {
      onSpellAdded(data);
      navigate('/');
    })
    .catch(err => console.error("Failed to add spell:", err));
  };

  return (
    <form onSubmit={handleSubmit} className="spell-form">
      <h2>Додати нове заклинання</h2>

      <label>Назва:</label>
      <input type="text" name="name" value={spell.name} onChange={handleInputChange} required />

      <label>Рівень ({spellConfig.spellLevels.min}-{spellConfig.spellLevels.max}):</label>
      <input 
        type="number" 
        name="level" 
        value={spell.level} 
        onChange={handleInputChange} 
        min={spellConfig.spellLevels.min} 
        max={spellConfig.spellLevels.max} 
        required 
      />

      <label>💠 Кількість дій ({spellConfig.actions.min}-{spellConfig.actions.max}):</label>
      <input 
        type="number" 
        name="actions" 
        value={spell.actions} 
        onChange={handleInputChange} 
        min={spellConfig.actions.min} 
        max={spellConfig.actions.max} 
        required 
      />
      
      <label>🚶 Відстань: ({spellConfig.range.units}):</label>
      <input 
        type="number" 
        name="range" 
        value={spell.range} 
        onChange={handleInputChange} 
        min={spellConfig.range.min} 
        required 
      />

      <div className="duration-group">
        <label>⌛ Тривалість:</label>
        <div className="duration-inputs">
          {spell.duration.unit !== 'until_short_rest' && 
           spell.duration.unit !== 'until_long_rest' && (
            <input
              type="number"
              name="duration.value"
              value={spell.duration.value}
              onChange={(e) => setSpell(prev => ({
                ...prev,
                duration: { ...prev.duration, value: e.target.value }
              }))}
              min="0"
              required={spellConfig.durationUnits.find(u => u.value === spell.duration.unit)?.requiresValue}
            />
          )}
          <select
            name="duration.unit"
            value={spell.duration.unit}
            onChange={(e) => setSpell(prev => ({
              ...prev,
              duration: { ...prev.duration, unit: e.target.value }
            }))}
          >
            {spellConfig.durationUnits.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
        {spellConfig.durationUnits.find(u => u.value === spell.duration.unit)?.requiresCustomUnit && (
          <input
            type="text"
            name="duration.customUnit"
            value={spell.duration.customUnit}
            onChange={(e) => setSpell(prev => ({
              ...prev,
              duration: { ...prev.duration, customUnit: e.target.value }
            }))}
            placeholder="Вкажи власну одиницю"
            className="custom-duration-input"
            required
          />
        )}
      </div>

      <div className="checkbox-group">
        <label>Арканічні традиції:</label>
        <div className="checkbox-options">
          {spellConfig.traditions.map(tradition => (
            <label key={tradition}>
              <input
                type="checkbox"
                value={tradition}
                checked={spell.traditions.includes(tradition)}
                onChange={handleTraditionChange}
              />
              {tradition}
            </label>
          ))}
        </div>
      </div>

      <div className="checkbox-inline">
        {spellConfig.flags.map(flag => (
          <label key={flag.name}>
            <input
              type="checkbox"
              name={flag.name}
              checked={spell[flag.name]}
              onChange={handleInputChange}
            />
            {flag.label}
          </label>
        ))}
      </div>

      <label>Складові:</label>
      {spell.components.map((component, index) => (
        <div key={index} className="component-input">
          <input
            type="text"
            value={component}
            onChange={(e) => handleComponentChange(index, e.target.value)}
            placeholder="Enter component description"
          />
          <button type="button" onClick={() => removeComponent(index)} className="remove-btn">-</button>
        </div>
      ))}
      <button type="button" onClick={addComponent} className="add-btn">+</button>

      <label>Наративний опис:</label>
      <textarea
        name="narrativeDescription"
        value={spell.narrativeDescription}
        onChange={handleInputChange}
        placeholder="Describe how the spell looks and feels when cast..."
        required
      />

      <label>Механічний опис:</label>
      <textarea
        name="mechanicalDescription"
        value={spell.mechanicalDescription}
        onChange={handleInputChange}
        placeholder="Describe the mechanical effects of the spell (damage, conditions, etc.)..."
        required
      />

      <div className="checkbox-inline">
        <label>
          <input
            type="checkbox"
            name="hasHigherLevels"
            checked={spell.hasHigherLevels}
            onChange={handleInputChange}
          />
          Має вищі рівні
        </label>
      </div>

      {spell.hasHigherLevels && (
        <div className="higher-levels-section">
          <h3>Вищі рівні</h3>
          <div className="level-buttons">
            {[...Array(spellConfig.spellLevels.max + 1)].map((_, i) => {
              if (i <= spell.level) return null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleLevelEffects(i)}
                  className={`level-button ${spell.higherLevels[i] ? 'active' : ''}`}
                >
                  {i}
                </button>
              );
            })}
          </div>
          
          {Object.entries(spell.higherLevels).map(([level, effects]) => (
            <div key={level} className="level-effects">
              <h4>Рівень {level}:</h4>
              <label>Наративний опис:</label>
              <textarea
                value={effects.narrative}
                onChange={(e) => handleHigherLevelChange(level, 'narrative', e.target.value)}
                placeholder="Describe how the spell changes visually at this level..."
              />
              
              <label>Механічний опис:</label>
              <textarea
                value={effects.mechanical}
                onChange={(e) => handleHigherLevelChange(level, 'mechanical', e.target.value)}
                placeholder="Describe the mechanical changes at this level..."
              />
              <button
                type="button"
                className="remove-level-button"
                onClick={() => removeLevelEffects(level)}
              >
                Видалити рівень {level}
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="submit">Додати заклинання</button>
    </form>
  );
};

export default SpellForm;
