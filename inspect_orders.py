import os
from sqlalchemy import create_engine, text

database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:myPass@localhost:5432/htxsale')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

def inspect_columns():
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            sql = text("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'")
            columns = [r[0] for r in conn.execute(sql)]
            print(f"Các cột đang có trong bảng 'orders': {', '.join(columns)}")
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    inspect_columns()
