import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/postgres"

def list_tables():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        print("Tables in 'postgres' database:")
        sql = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        for r in conn.execute(sql):
            print(f"- {r[0]}")

if __name__ == "__main__":
    list_tables()
