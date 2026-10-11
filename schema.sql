-- ================================================================
-- ESQUEMA EXACTO DE BASE DE DATOS SUPABASE (MULTI-TENANT LEALTAD)
-- Coincide 1:1 con el Diagrama de Entidad-Relación de Supabase
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT DEFAULT '',
    primary_color VARCHAR(10) DEFAULT '#788C5A',
    secondary_color VARCHAR(10) DEFAULT '#CFD989',
    bg_color VARCHAR(10) DEFAULT '#FAF7F2',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    loyalty_code VARCHAR(50),
    current_points INT DEFAULT 0,
    total_points_earned INT DEFAULT 0,
    total_points_spent INT DEFAULT 0,
    total_purchases_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255),
    current_stamps INT DEFAULT 0,
    max_stamps INT DEFAULT 10,
    total_stamps_earned INT DEFAULT 0,
    wallet_hero_image_url TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'customer'
);

-- 3. TABLA: stamp_images (0 a 10 sellos)
CREATE TABLE IF NOT EXISTS stamp_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stamp_count INT NOT NULL,
    image_url TEXT NOT NULL,
    wallet_hero_url TEXT,
    nombre_sello VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- 4. TABLA: products (Catálogo de Recompensas)
CREATE TABLE IF NOT EXISTS products (
    id_prod UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto VARCHAR(255) NOT NULL,
    precio NUMERIC(10, 2) DEFAULT 0.00,
    puntos_requeridos INT DEFAULT 0,
    piezas_disponibles INT DEFAULT 100,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- 5. TABLA: points_rules (Regla de Conversión Dinámica)
CREATE TABLE IF NOT EXISTS points_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monto_dinero NUMERIC(10, 2) DEFAULT 10.00,
    puntos_otorgados INT DEFAULT 1,
    descripcion TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- 6. TABLA: transactions (Historial)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'PURCHASE', 'REDEMPTION', 'ADJUSTMENT'
    purchase_amount NUMERIC(10, 2) DEFAULT 0.00,
    points_transacted INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE
);

-- 7. TABLA: wallet_settings
CREATE TABLE IF NOT EXISTS wallet_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    max_sellos INT DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: stamp_levels
CREATE TABLE IF NOT EXISTS stamp_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nivel_sello INT NOT NULL,
    imagen_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HABILITAR RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
