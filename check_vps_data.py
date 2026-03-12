import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def check():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        print("Checking actual data on VPS...")
        sql = text("SELECT id, payment_method, description FROM orders WHERE description IS NOT NULL ORDER BY created_at DESC LIMIT 20")
        rows = conn.execute(sql).fetchall()
        for r in rows:
            print(f"ID: {r[0]} | PM: {r[1]} | Desc: [{r[2]}]")

if __name__ == "__main__":
    check()
