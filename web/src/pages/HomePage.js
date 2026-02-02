import React from 'react';
import ServiceCard from '../components/common/ServiceCard';
import './HomePage.css';

const services = [
  {
    id: 'spells',
    title: 'Книга заклинань',
    description: 'Каталог магічних заклинань з детальним описом ефектів та вимог до застосування',
    path: '/spells',
    icon: '\u2728',
    isActive: true,
  },
  {
    id: 'bestiary',
    title: 'Бестіарій',
    description: 'Довідник істот та монстрів з їхніми характеристиками та особливостями',
    path: '/bestiary',
    icon: '\uD83D\uDC09',
    isActive: false,
  },
  {
    id: 'atlas',
    title: 'Атлас',
    description: 'Карти світів та локацій для ваших пригод',
    path: '/atlas',
    icon: '\uD83D\uDDFA\uFE0F',
    isActive: false,
  },
  {
    id: 'characters',
    title: 'Листи персонажів',
    description: 'Створення та керування персонажами для настільних рольових ігор',
    path: '/characters',
    icon: '\uD83D\uDCDC',
    isActive: false,
  },
  {
    id: 'profile',
    title: 'Особистий кабінет',
    description: 'Налаштування профілю та збережені дані',
    path: '/profile',
    icon: '\uD83D\uDC64',
    isActive: false,
  },
];

const HomePage = () => {
  return (
    <main className="home-page">
      <section className="hero">
        <h1 className="hero-title">WALP Tabletop</h1>
        <p className="hero-subtitle">Інструменти для настільних рольових ігор</p>
      </section>

      <section className="services-section">
        <h2 className="section-title">Розділи</h2>
        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              path={service.path}
              icon={service.icon}
              isActive={service.isActive}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
