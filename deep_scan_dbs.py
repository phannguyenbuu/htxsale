import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def scan_all_dbs():
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                print(f"--- DB: {db_name} ---")
                # List all tables
                tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).fetchall()
                table_names = [t[0] for t in tables]
                print(f"  Tables: {', '.join(table_names)}")
                
                # Check for orders table
                if 'orders' in table_names:
                    count = conn.execute(text("SELECT count(*) FROM orders")).scalar()
                    print(f"  ==> Found 'orders' with {count} rows")
                elif 'order' in table_names:
                    count = conn.execute(text("SELECT count(*) FROM \"order\"")).scalar()
                    print(f"  ==> Found 'order' (singular) with {count} rows")

                # Check for users table
                if 'user' in table_names:
                    count = conn.execute(text("SELECT count(*) FROM \"user\"")).scalar()
                    print(f"  ==> Found 'user' with {count} rows")
                elif 'users' in table_names:
                    count = conn.execute(text("SELECT count(*) FROM users")).scalar()
                    print(f"  ==> Found 'users' with {count} rows")

        except Exception as e:
            print(f"--- DB: {db_name} error: {e}")

if __name__ == "__main__":
    scan_all_dbs()
