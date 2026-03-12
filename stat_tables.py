import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def list_all_tables():
    try:
        engine = sqlalchemy.create_engine(DB_URL)
        with engine.connect() as conn:
            print("--- THỐNG KÊ DATABASE 'htxsale' ---")
            
            # 1. Liệt kê danh sách các bảng
            sql_tables = text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
            """)
            tables = [r[0] for r in conn.execute(sql_tables)]
            print(f"Tổng số bảng: {len(tables)}")
            
            # 2. Thống kê số lượng bản ghi từng bảng
            for table in tables:
                sql_count = text(f'SELECT count(*) FROM "{table}"')
                count = conn.execute(sql_count).scalar()
                print(f"- Bảng '{table}': {count} bản ghi")
                
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    list_all_tables()
