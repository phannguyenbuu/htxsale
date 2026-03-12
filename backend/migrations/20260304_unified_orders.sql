-- Unified Orders migration (backward compatible)

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY,
    stt INTEGER,
    date DATE,
    transfer_date DATE,
    plate_number VARCHAR(20),
    driver_name VARCHAR(100),
    phone VARCHAR(20),
    htx VARCHAR(100),
    description TEXT,
    amount NUMERIC(14,2) DEFAULT 0 CHECK (amount >= 0),
    service_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_services (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    amount NUMERIC(14,2) DEFAULT 0 CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS order_payments (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    bank_account VARCHAR(20) NOT NULL CHECK (bank_account IN ('trung', 'quyen')),
    amount NUMERIC(14,2) DEFAULT 0 CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS order_notes (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_plate_number ON orders(plate_number);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_htx ON orders(htx);
CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);

