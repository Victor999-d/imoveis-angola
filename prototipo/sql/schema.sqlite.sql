-- Imóveis Angola - Schema SQLite
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK(role IN ('ADMIN','OWNER','CLIENT')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE owner_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  bi_number TEXT,
  nif TEXT,
  province TEXT,
  municipality TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE client_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  bi_number TEXT,
  province TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'RESIDENTIAL',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  monthly_price REAL NOT NULL,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  living_rooms INTEGER NOT NULL DEFAULT 0,
  area_sqm REAL,
  is_furnished INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE negotiations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  agreed_price REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  percentage REAL NOT NULL DEFAULT 10.00,
  calculated_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commission_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  method TEXT NOT NULL DEFAULT 'bank_transfer',
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  FOREIGN KEY (commission_id) REFERENCES commissions(id)
);

-- Password de todos: password
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin Sistema', 'admin@imoveis.ao', '+244900000001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('João Proprietário', 'joao@email.ao', '+244923456789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'OWNER'),
('Maria Cliente', 'maria@email.ao', '+244912345678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CLIENT');

INSERT INTO owner_profiles (user_id, province, municipality) VALUES (2, 'Luanda', 'Luanda');
INSERT INTO client_profiles (user_id, province) VALUES (3, 'Luanda');

INSERT INTO properties (owner_id, title, slug, description, type, status, province, municipality, neighborhood, address, monthly_price, bedrooms, bathrooms, living_rooms, area_sqm, is_furnished, image_url, published_at) VALUES
(2, 'Apartamento T3 em Talatona', 'apartamento-t3-talatona', 'Excelente apartamento T3 em Talatona, condomínio fechado com segurança 24h, piscina e ginásio.', 'APARTMENT', 'PUBLISHED', 'Luanda', 'Belas', 'Talatona', 'Rua Principal, Edifício Atlântico, 5º andar', 450000.00, 3, 2, 1, 120.00, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', datetime('now')),
(2, 'Vivenda T4 no Kilamba', 'vivenda-t4-kilamba', 'Vivenda espaçosa T4 no Kilamba, com quintal e garagem para 2 carros.', 'VILLA', 'PUBLISHED', 'Luanda', 'Belas', 'Kilamba', 'Rua B, Casa 45, Centralidade do Kilamba', 650000.00, 4, 3, 2, 220.00, 1, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', datetime('now')),
(2, 'Estúdio mobilado no Centro', 'estudio-centro-luanda', 'Estúdio moderno e mobilado no centro de Luanda.', 'STUDIO', 'PUBLISHED', 'Luanda', 'Luanda', 'Ingombota', 'Av. 4 de Fevereiro, n.º 120', 180000.00, 0, 1, 1, 35.00, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', datetime('now')),
(2, 'Casa T2 em Viana', 'casa-t2-viana', 'Casa T2 em Viana, zona calma, com quintal.', 'HOUSE', 'PENDING_VERIFICATION', 'Luanda', 'Viana', 'Zango', 'Rua das Acácias, Casa 12', 200000.00, 2, 1, 1, 85.00, 0, NULL, NULL);

INSERT INTO visits (property_id, client_id, scheduled_date, scheduled_time, message, status) VALUES
(1, 3, date('now', '+3 day'), '10:00', 'Gostaria de visitar o apartamento.', 'PENDING'),
(2, 3, date('now', '+5 day'), '15:00', NULL, 'CONFIRMED');
