-- Inicialización de la base de datos para admin-financiera

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de bancos
CREATE TABLE IF NOT EXISTS banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) DEFAULT 'Argentina',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de tarjetas
CREATE TABLE IF NOT EXISTS card_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tarjetas de crédito del usuario
CREATE TABLE IF NOT EXISTS credit_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bank_id INTEGER REFERENCES banks(id),
    card_type_id INTEGER REFERENCES card_types(id),
    last_four_digits VARCHAR(4),
    card_name VARCHAR(100) NOT NULL,
    closing_day INTEGER DEFAULT 31,
    payment_day INTEGER DEFAULT 10,
    credit_limit DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de ingresos
CREATE TABLE IF NOT EXISTS income_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#4CAF50',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías de gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#F44336',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS incomes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES income_categories(id),
    amount DECIMAL(12,2) NOT NULL,
    description VARCHAR(255),
    income_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES expense_categories(id),
    credit_card_id INTEGER REFERENCES credit_cards(id),
    amount DECIMAL(12,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card')),
    installments INTEGER DEFAULT 1,
    current_installment INTEGER DEFAULT 1,
    installment_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO banks (name, country) VALUES 
('Banco Santander', 'Argentina'),
('Banco Galicia', 'Argentina'),
('BBVA', 'Argentina'),
('Banco Nación', 'Argentina'),
('Banco Macro', 'Argentina'),
('HSBC', 'Argentina'),
('Banco Ciudad', 'Argentina');

INSERT INTO card_types (name) VALUES 
('Visa'),
('Mastercard'),
('American Express');

-- Insertar categorías predefinidas según la estructura del Excel
INSERT INTO expense_categories (name, color, user_id) VALUES 
('Impuestos y Servicios', '#FF5722', NULL),
('Gastos Generales', '#2196F3', NULL),
('Alimentación', '#4CAF50', NULL),
('Transporte', '#FF9800', NULL),
('Entretenimiento', '#9C27B0', NULL),
('Salud', '#F44336', NULL);

INSERT INTO income_categories (name, color, user_id) VALUES 
('Ingreso Mensual', '#4CAF50', NULL),
('Sueldo', '#2E7D32', NULL),
('Freelance', '#388E3C', NULL),
('Bonos', '#43A047', NULL),
('Otros Ingresos', '#66BB6A', NULL);

-- Tabla de tipos de activos
CREATE TABLE IF NOT EXISTS asset_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('stocks', 'bonds', 'crypto', 'currency', 'savings')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de activos del usuario
CREATE TABLE IF NOT EXISTS user_assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_type_id INTEGER REFERENCES asset_types(id),
    name VARCHAR(100) NOT NULL,
    quantity DECIMAL(15,8) DEFAULT 0,
    purchase_price DECIMAL(12,2),
    current_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'ARS',
    purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de usuario (para trackear si completó onboarding)
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferred_currency VARCHAR(3) DEFAULT 'ARS',
    show_tutorial BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar tipos de activos predefinidos
INSERT INTO asset_types (name, category) VALUES 
('Acciones Argentinas', 'stocks'),
('Acciones Estadounidenses', 'stocks'),
('Bonos Soberanos', 'bonds'),
('Bonos Corporativos', 'bonds'),
('Dólar Estadounidense', 'currency'),
('Euro', 'currency'),
('Bitcoin', 'crypto'),
('Ethereum', 'crypto'),
('Plazo Fijo', 'savings'),
('Fondo Común de Inversión', 'savings');

-- Crear índices para mejorar performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_incomes_user_date ON incomes(user_id, income_date);
CREATE INDEX idx_credit_cards_user ON credit_cards(user_id);
CREATE INDEX idx_expenses_credit_card ON expenses(credit_card_id);
CREATE INDEX idx_user_assets_user ON user_assets(user_id);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);