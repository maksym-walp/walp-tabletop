-- Створюємо таблиці
CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE DATABASE IF NOT EXISTS spells_db;
USE spells_db;

-- Тут ми зберігаємо списки. Зверни увагу: user_id тепер просто число.
-- Ми НЕ можемо зробити FOREIGN KEY на таблицю з іншої бази даних (auth_db),
-- якщо плануємо розносити їх фізично. Це плата за мікросервісність.
CREATE TABLE IF NOT EXISTS spellbooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level TINYINT NOT NULL,
  actions TINYINT NOT NULL,
  spell_range INT NOT NULL,
  concentration BOOLEAN NOT NULL DEFAULT FALSE,
  ritual BOOLEAN NOT NULL DEFAULT FALSE,
  duration_value INT DEFAULT NULL,
  duration_unit VARCHAR(50) DEFAULT 'moment',
  duration_custom_unit VARCHAR(100) DEFAULT NULL,
  narrative_description TEXT,
  mechanical_description TEXT,
  has_higher_levels BOOLEAN NOT NULL DEFAULT FALSE,
  components JSON,
  higher_levels JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS traditions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS spellbook_spells (
    spellbook_id INT NOT NULL,
    spell_id INT NOT NULL,
    PRIMARY KEY (spellbook_id, spell_id),
    FOREIGN KEY (spellbook_id) REFERENCES spellbooks(id) ON DELETE CASCADE,
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spell_traditions (
  spell_id INT NOT NULL,
  tradition_id INT NOT NULL,
  PRIMARY KEY (spell_id, tradition_id),
  FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
  FOREIGN KEY (tradition_id) REFERENCES traditions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Наповнюємо даними
INSERT INTO traditions (name) VALUES
('Медус'), ('Стихії'), ('Фераїс'), ('Лореліс'), ('Аворелія'),
('Некромантія'), ('Сільферус'), ('Пентеони'), ('Обскурус'),
('Астрамантія'), ('Санґатус'), ('Геометрія'), ('Алхімія')
ON DUPLICATE KEY UPDATE name=name;

-- Створення окремих користувачів для кожного сервісу
-- Auth service user
CREATE USER IF NOT EXISTS 'auth_user'@'%' IDENTIFIED BY 'auth_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON auth_db.* TO 'auth_user'@'%';

-- Spell service user
CREATE USER IF NOT EXISTS 'spells_user'@'%' IDENTIFIED BY 'spells_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON spells_db.* TO 'spells_user'@'%';

FLUSH PRIVILEGES;

