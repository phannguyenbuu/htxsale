import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def find_any_data():
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                sql = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                tables = conn.execute(sql).fetchall()
                for t in tables:
                    name = t[0]
                    count = conn.execute(text(f'SELECT count(*) FROM "{name}"')).scalar()
                    if count > 0:
                        print(f"Database '{db_name}' -> Table '{name}' has {count} rows.")
        except:
            continue

if __name__ == "__main__":
    find_any_data()
