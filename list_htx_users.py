import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def list_users():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        res = conn.execute(text('SELECT id, username, role FROM "user"')).fetchall()
        for r in res:
            print(f"ID: {r[0]}, Username: {r[1]}, Role: {r[2]}")

if __name__ == "__main__":
    list_users()
