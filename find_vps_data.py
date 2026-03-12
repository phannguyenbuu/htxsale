import sqlalchemy
from sqlalchemy import text

DB_LIST = ["odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def find_data():
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Check if orders table exists and has data
                # Updated logic: Mark 'Chưa TT' in status column to preserve payment_method
                sql = text("SELECT count(*) FROM orders")
                count = conn.execute(sql).scalar()
                print(f"Database '{db_name}' has {count} orders.")
                if count > 0:
                    update_sql = text("UPDATE orders SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL)")
                    res = conn.execute(update_sql)
                    conn.commit()
                    if res.rowcount > 0:
                        print(f"Updated {res.rowcount} orders to status 'Chưa TT' in {db_name}.")
        except Exception:
            # Table or column might not exist, skip
            continue

if __name__ == "__main__":
    find_data()
