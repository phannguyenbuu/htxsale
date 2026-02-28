#!/usr/bin/env bash
set -euo pipefail

# Setup/upgrade DB schema for sale_admin feature.
# Defaults:
#   PGUSER=postgres
#   PGPASSWORD=myPass
#   PGDATABASE=htxsale

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-myPass}"
PGDATABASE="${PGDATABASE:-htxsale}"

export PGPASSWORD

echo "Applying schema updates to postgresql://${PGUSER}@${PGHOST}:${PGPORT}/${PGDATABASE}"

psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 <<'SQL'
ALTER TABLE IF EXISTS "user" ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE IF EXISTS "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

CREATE TABLE IF NOT EXISTS htx (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  logo_stock INTEGER DEFAULT 0,
  card_stock INTEGER DEFAULT 0,
  tshirt_stock INTEGER DEFAULT 0
);

ALTER TABLE htx ADD COLUMN IF NOT EXISTS tshirt_stock INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS tshirt (
  id VARCHAR PRIMARY KEY,
  htx VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 0,
  image_url VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS bill (
  id VARCHAR PRIMARY KEY,
  htx VARCHAR(100) NOT NULL,
  driver_name VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  details TEXT,
  logo_qty INTEGER DEFAULT 0,
  card_qty INTEGER DEFAULT 0,
  tshirt_qty INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  payment_method VARCHAR(20) DEFAULT 'Chuyển Khoản',
  delivery_method VARCHAR(40),
  delivery_address TEXT,
  sale_user_id INTEGER REFERENCES "user"(id),
  sale_username VARCHAR(80),
  sale_name VARCHAR(100),
  sale_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'paid',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bill_created_at ON bill(created_at);
CREATE INDEX IF NOT EXISTS idx_bill_sale_username ON bill(sale_username);
CREATE INDEX IF NOT EXISTS idx_bill_htx ON bill(htx);

-- seed HTX rows
INSERT INTO htx (name, logo_stock, card_stock, tshirt_stock) VALUES
('MINH VY', 100, 100, 100),
('THANH VY', 100, 100, 100),
('KIM THỊNH', 100, 100, 100),
('NGHĨA PHÁT', 100, 100, 100),
('MINH VY TIỀN GIANG', 100, 100, 100)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE bill ADD COLUMN IF NOT EXISTS tshirt_qty INTEGER DEFAULT 0;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS tshirt_qty INTEGER DEFAULT 0;

-- Sync htx stock from legacy tables if present
UPDATE htx h
SET logo_stock = l.quantity
FROM logo l
WHERE l.htx = h.name;

UPDATE htx h
SET card_stock = c.quantity
FROM card c
WHERE c.htx = h.name;

UPDATE htx h
SET tshirt_stock = t.quantity
FROM tshirt t
WHERE t.htx = h.name;

-- Ensure legacy tables mirror htx too
UPDATE logo l
SET quantity = h.logo_stock
FROM htx h
WHERE h.name = l.htx;

UPDATE card c
SET quantity = h.card_stock
FROM htx h
WHERE h.name = c.htx;

INSERT INTO tshirt (id, htx, name, quantity)
SELECT
  'A-' || h.name || '-INIT',
  h.name,
  'Tshirt ' || h.name,
  h.tshirt_stock
FROM htx h
WHERE NOT EXISTS (
  SELECT 1 FROM tshirt t WHERE t.htx = h.name
);

UPDATE tshirt t
SET quantity = h.tshirt_stock
FROM htx h
WHERE h.name = t.htx;
SQL

echo "Schema setup completed."
