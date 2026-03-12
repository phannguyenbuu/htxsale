set -e
export PGPASSWORD=myPass
psql -h localhost -U postgres -d htxsale -c "SELECT id, username, role, password_hash FROM \"user\" ORDER BY id;"
