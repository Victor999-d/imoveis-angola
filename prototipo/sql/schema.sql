-- Imóveis Angola - Protótipo SQL (MySQL/MariaDB)
CREATE DATABASE IF NOT EXISTS imoveis_angola CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE imoveis_angola;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(30) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','OWNER','CLIENT') NOT NULL DEFAULT 'CLIENT',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE owner_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bi_number VARCHAR(50) DEFAULT NULL,
  nif VARCHAR(50) DEFAULT NULL,
  province VARCHAR(80) DEFAULT NULL,
  municipality VARCHAR(80) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE client_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bi_number VARCHAR(50) DEFAULT NULL,
  province VARCHAR(80) DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type ENUM('APARTMENT','HOUSE','VILLA','STUDIO','COMMERCIAL','LAND','OFFICE','WAREHOUSE') NOT NULL,
  category ENUM('RESIDENTIAL','COMMERCIAL','MIXED') NOT NULL DEFAULT 'RESIDENTIAL',
  status ENUM('DRAFT','PENDING_VERIFICATION','CORRECTIONS_REQUESTED','APPROVED','PUBLISHED','REJECTED','SUSPENDED','RENTED') NOT NULL DEFAULT 'DRAFT',
  province VARCHAR(80) NOT NULL,
  municipality VARCHAR(80) NOT NULL,
  neighborhood VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  monthly_price DECIMAL(15,2) NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  living_rooms INT NOT NULL DEFAULT 0,
  area_sqm DECIMAL(10,2) DEFAULT NULL,
  is_furnished TINYINT(1) NOT NULL DEFAULT 0,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at DATETIME DEFAULT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_province (province),
  INDEX idx_price (monthly_price)
) ENGINE=InnoDB;

CREATE TABLE visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  client_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(10) NOT NULL,
  message TEXT DEFAULT NULL,
  status ENUM('PENDING','CONFIRMED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE negotiations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  client_id INT NOT NULL,
  status ENUM('OPEN','IN_PROGRESS','AGREED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  agreed_price DECIMAL(15,2) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE commissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  owner_id INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  calculated_amount DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING','PAID','OVERDUE') NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME DEFAULT NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commission_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method ENUM('bank_transfer','multicaixa','unitel_money','cash','other') NOT NULL DEFAULT 'bank_transfer',
  reference VARCHAR(100) DEFAULT NULL,
  status ENUM('PENDING','CONFIRMED','FAILED') NOT NULL DEFAULT 'PENDING',
  notes TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME DEFAULT NULL,
  FOREIGN KEY (commission_id) REFERENCES commissions(id)
) ENGINE=InnoDB;

-- Password de todos: password
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin Sistema', 'admin@imoveis.ao', '+244900000001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('João Proprietário', 'joao@email.ao', '+244923456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OWNER'),
('Maria Cliente', 'maria@email.ao', '+244912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT');

INSERT INTO owner_profiles (user_id, province, municipality) VALUES (2, 'Luanda', 'Luanda');
INSERT INTO client_profiles (user_id, province) VALUES (3, 'Luanda');

INSERT INTO properties (owner_id, title, slug, description, type, status, province, municipality, neighborhood, address, monthly_price, bedrooms, bathrooms, living_rooms, area_sqm, is_furnished, image_url, published_at) VALUES
(2, 'Apartamento T3 em Talatona', 'apartamento-t3-talatona', 'Excelente apartamento T3 em Talatona, condomínio fechado com segurança 24h, piscina e ginásio.', 'APARTMENT', 'PUBLISHED', 'Luanda', 'Belas', 'Talatona', 'Rua Principal, Edifício Atlântico, 5º andar', 450000.00, 3, 2, 1, 120.00, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', NOW()),
(2, 'Vivenda T4 no Kilamba', 'vivenda-t4-kilamba', 'Vivenda espaçosa T4 no Kilamba, com quintal e garagem para 2 carros.', 'VILLA', 'PUBLISHED', 'Luanda', 'Belas', 'Kilamba', 'Rua B, Casa 45, Centralidade do Kilamba', 650000.00, 4, 3, 2, 220.00, 1, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', NOW()),
(2, 'Estúdio mobilado no Centro', 'estudio-centro-luanda', 'Estúdio moderno e mobilado no centro de Luanda.', 'STUDIO', 'PUBLISHED', 'Luanda', 'Luanda', 'Ingombota', 'Av. 4 de Fevereiro, n.º 120', 180000.00, 0, 1, 1, 35.00, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', NOW()),
(2, 'Casa T2 em Viana', 'casa-t2-viana', 'Casa T2 em Viana, zona calma, com quintal.', 'HOUSE', 'PENDING_VERIFICATION', 'Luanda', 'Viana', 'Zango', 'Rua das Acácias, Casa 12', 200000.00, 2, 1, 1, 85.00, 0, NULL, NULL);

INSERT INTO visits (property_id, client_id, scheduled_date, scheduled_time, message, status) VALUES
(1, 3, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00', 'Gostaria de visitar o apartamento.', 'PENDING'),
(2, 3, DATE_ADD(CURDATE(), INTERVAL 5 DAY), '15:00', NULL, 'CONFIRMED');
