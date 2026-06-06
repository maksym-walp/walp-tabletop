import React from "react";
import { Link } from "react-router-dom";
import spellConfig from "../../config/spellConfig.json";
import "./SpellCard.css";

const SpellCard = ({ spell }) => {
  const getDurationText = (duration) => {
    if (duration.unit === "moment") return "Мить";
    const unit = spellConfig.durationUnits.find(
      (u) => u.value === duration.unit,
    );
    if (!unit) return "Невідомо";

    if (!unit.requiresValue) return unit.label;
    if (duration.unit === "custom")
      return `${duration.value} ${duration.customUnit}`;
    return `${duration.value} ${unit.label.toLowerCase()}`;
  };

  return (
    <Link to={`/spells/${spell.id}`} className="spell-card-link">
      <div className="spell-card">
        <h3>
          {spell.name.length > 15
            ? spell.name.slice(0, 15) + "..."
            : spell.name}
        </h3>
        <div className="spell-card-meta">
          <span className="level">Рівень {spell.level}</span>
          <div className="flags">
            {spellConfig.flags.map(
              (flag) =>
                spell[flag.name] && (
                  <span key={flag.name} className="flag">
                    {flag.label}
                  </span>
                ),
            )}
          </div>
        </div>
        <div className="spell-card-details">
          <p>
            <strong>💠 Дії:</strong> {spell.actions}
          </p>
          <p>
            <strong>🚶 Відстань:</strong> {spell.range}{" "}
            {spellConfig.range.units}
          </p>
          <p>
            <strong>⌛ Тривалість:</strong> {getDurationText(spell.duration)}
          </p>
        </div>
        <p className="traditions">
          <strong>Традиції:</strong>{" "}
          {(spell.traditions || []).join(", ") || "Не вказано"}
          <Link
            to="/traditions"
            className="traditions-info-link"
            onClick={(e) => e.stopPropagation()}
          >
            ?
          </Link>
        </p>
        <p className="spell-description">{spell.narrativeDescription}</p>
        {spell.hasHigherLevels && (
          <div className="higher-levels-indicator">
            ✨ Має ефекти вищих рівнів
          </div>
        )}
      </div>
    </Link>
  );
};

export default SpellCard;
