#!/usr/bin/env bash
set -euo pipefail

# Reset the whole public schema for htxsale and recreate tables from backend/app.py
# Defaults requested by project owner:
#   PGUSER=postgres
#   PGPASSWORD=myPass

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-myPass}"
PGDATABASE="${PGDATABASE:-htxsale}"

export PGPASSWORD

echo "Target DB: postgresql://${PGUSER}@${PGHOST}:${PGPORT}/${PGDATABASE}"
echo "This will DROP SCHEMA public CASCADE (delete all tables/data)."

if [[ "${FORCE_RESET:-0}" != "1" ]]; then
  read -r -p "Type YES to continue: " CONFIRM
  if [[ "${CONFIRM}" != "YES" ]]; then
    echo "Cancelled."
    exit 1
  fi
fi

echo "Dropping and recreating schema..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -v ON_ERROR_STOP=1 <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
SQL

echo "Recreating tables via SQLAlchemy models in backend/app.py..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
python -c "import app"

echo "Done. Database schema/data has been reset and re-initialized."
