import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

const ServiceCard = ({ title, description, path, icon, isActive }) => {
  const CardWrapper = isActive ? Link : 'div';
  const wrapperProps = isActive ? { to: path } : {};

  return (
    <CardWrapper
      className={`service-card ${isActive ? 'active' : 'disabled'}`}
      {...wrapperProps}
    >
      <div className="service-icon">{icon}</div>
      <h2 className="service-title">{title}</h2>
      <p className="service-description">{description}</p>
      {!isActive && (
        <div className="service-status">
          <span className="status-badge">В розробці</span>
        </div>
      )}
      {isActive && (
        <div className="service-arrow">
          <span>Перейти</span>
        </div>
      )}
    </CardWrapper>
  );
};

export default ServiceCard;
