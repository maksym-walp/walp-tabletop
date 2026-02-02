import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const menuItems = [
    { path: '/spells', label: 'Книга заклинань', active: true },
    { path: '/bestiary', label: 'Бестіарій', active: false },
    { path: '/atlas', label: 'Атлас', active: false },
    { path: '/characters', label: 'Персонажі', active: false },
    { path: '/profile', label: 'Кабінет', active: false },
  ];

  return (
    <header className="app-header" ref={menuRef}>
      <Link to="/" className="logo">
        <h1>WALP</h1>
      </Link>

      {isMobile ? (
        <>
          <button
            className={`burger-button ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${!item.active ? 'disabled' : ''} ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
                {!item.active && <span className="coming-soon-badge">Скоро</span>}
              </Link>
            ))}
          </nav>
        </>
      ) : (
        <nav className="desktop-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${!item.active ? 'disabled' : ''} ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.label}
              {!item.active && <span className="coming-soon-badge">Скоро</span>}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
