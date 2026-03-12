import sqlalchemy
from sqlalchemy import text

CREDS = "postgresql://postgres:myPass@localhost:5432/htxsale"
engine = sqlalchemy.create_engine(CREDS)

def check():
    with engine.connect() as conn:
        print(f"Checking database 'htxsale'...")
        try:
            # SQLAlchemy might need double quotes for the table name "user" since it is a reserved word
            count = conn.execute(text('SELECT count(*) FROM "user"')).scalar()
            print(f"Table 'user' contains {count} records.")
            if count > 0:
                rows = conn.execute(text('SELECT id, username, role FROM "user"')).fetchall()
                for r in rows:
                    print(f"  - ID {r[0]}: {r[1]} (Role: {r[2]})")
        except Exception as e:
            print(f"Table 'user' check error: {e}")

        try:
            count = conn.execute(text("SELECT count(*) FROM orders")).scalar()
            print(f"Table 'orders' contains {count} records.")
        except Exception as e:
            print(f"Table 'orders' check error: {e}")

if __name__ == "__main__":
    check()
