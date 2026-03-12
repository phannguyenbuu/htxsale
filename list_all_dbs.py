import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/postgres"

def list_dbs():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        print("Available databases:")
        rows = conn.execute(text("SELECT datname FROM pg_database WHERE datistemplate = false")).fetchall()
        for r in rows:
            print(f"- {r[0]}")

if __name__ == "__main__":
    list_dbs()
