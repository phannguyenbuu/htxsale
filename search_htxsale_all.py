import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def search_text_everywhere():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        # Lấy tất cả các bảng
        sql_tables = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [r[0] for r in conn.execute(sql_tables).fetchall()]
        
        print(f"Searching in {len(tables)} tables in 'htxsale'...")
        
        for table in tables:
            # Lấy các cột chuỗi của bảng này
            sql_cols = text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '{table}' 
                AND data_type IN ('text', 'character varying')
            """)
            cols = [r[0] for r in conn.execute(sql_cols).fetchall()]
            
            for col in cols:
                try:
                    query = text(f'SELECT count(*) FROM "{table}" WHERE "{col}" ILIKE \'%Chưa TT%\'')
                    count = conn.execute(query).scalar()
                    if count > 0:
                        print(f"FOUND: Table '{table}', Column '{col}' has {count} matches.")
                except:
                    continue

if __name__ == "__main__":
    search_text_everywhere()
