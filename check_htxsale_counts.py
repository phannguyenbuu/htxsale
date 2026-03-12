import sqlalchemy
from sqlalchemy import text

CREDS = "postgresql://postgres:myPass@localhost:5432/htxsale"
engine = sqlalchemy.create_engine(CREDS)

def check_counts():
    with engine.connect() as conn:
        for table in ['"order"', "bill", "orders", '"user"', "htx"]:
            try:
                count = conn.execute(text(f"SELECT count(*) FROM {table}")).scalar()
                print(f"Table {table}: {count} records.")
            except Exception:
                print(f"Table {table}: Not found or error.")

if __name__ == "__main__":
    check_counts()
