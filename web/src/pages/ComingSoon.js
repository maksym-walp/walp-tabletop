import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ComingSoon.css';

const sectionInfo = {
  '/bestiary': {
    title: 'Бестіарій',
    icon: '\uD83D\uDC09',
    description: 'Довідник істот та монстрів з їхніми характеристиками, здібностями та тактикою бою',
  },
  '/atlas': {
    title: 'Атлас',
    icon: '\uD83D\uDDFA\uFE0F',
    description: 'Інтерактивні карти світів та локацій для планування пригод',
  },
  '/characters': {
    title: 'Листи персонажів',
    icon: '\uD83D\uDCDC',
    description: 'Зручний інструмент для створення та керування персонажами',
  },
  '/profile': {
    title: 'Особистий кабінет',
    icon: '\uD83D\uDC64',
    description: 'Налаштування профілю, збережені персонажі та історія сесій',
  },
};

const ComingSoon = () => {
  const location = useLocation();
  const info = sectionInfo[location.pathname] || {
    title: 'Розділ',
    icon: '\uD83D\uDD27',
    description: 'Цей розділ наразі в розробці',
  };

  return (
    <main className="coming-soon-page">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">{info.icon}</div>
        <h1 className="coming-soon-title">{info.title}</h1>
        <p className="coming-soon-description">{info.description}</p>

        <div className="coming-soon-badge-container">
          <span className="coming-soon-badge-large">В розробці</span>
        </div>

        <p className="coming-soon-message">
          Ми працюємо над цим розділом. Слідкуйте за оновленнями!
        </p>

        <Link to="/" className="back-home-button">
          На головну
        </Link>
      </div>
    </main>
  );
};

export default ComingSoon;
