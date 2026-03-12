import sqlalchemy
from sqlalchemy import text

# Connect to default postgres DB to list others
DB_URL = "postgresql://postgres:myPass@localhost:5432/postgres"

def list_dbs():
    try:
        engine = sqlalchemy.create_engine(DB_URL)
        with engine.connect() as conn:
            print("Listing all databases...")
            sql = text("SELECT datname FROM pg_database WHERE datistemplate = false;")
            rows = conn.execute(sql).fetchall()
            for r in rows:
                print(f"- {r[0]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_dbs()
