import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def search_text_everywhere():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        print(f"Checking connection to {DB_URL}...")
        try:
            conn.execute(text("SELECT 1"))
            print("Connection successful.")
        except Exception as e:
            print(f"Connection failed: {e}")
            return

        sql_tables = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [r[0] for r in conn.execute(sql_tables).fetchall()]
        
        print(f"Searching in {len(tables)} tables: {tables}")
        
        for table in tables:
            sql_cols = text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND data_type IN ('text', 'character varying')")
            cols = [r[0] for r in conn.execute(sql_cols).fetchall()]
            
            for col in cols:
                try:
                    q = text(f'SELECT count(*) FROM "{table}" WHERE "{col}" ILIKE \'%Chưa TT%\'')
                    count = conn.execute(q).scalar()
                    if count > 0:
                        print(f"FOUND: Table '{table}', Column '{col}' has {count} matches.")
                    # Thử lấy 1 dòng dữ liệu bất kỳ
                    q_any = text(f'SELECT count(*) FROM "{table}"')
                    any_count = conn.execute(q_any).scalar()
                    print(f"Table '{table}' total rows: {any_count}")
                    break # Chỉ cần in total rows 1 lần cho mỗi table
                except Exception as e:
                    continue

if __name__ == "__main__":
    search_text_everywhere()
