import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def inspect_htxsale():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        print("--- CÁC BẢNG TRONG HTXSALE ---")
        sql = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = conn.execute(sql).fetchall()
        for t in tables:
            name = t[0]
            count = conn.execute(text(f'SELECT count(*) FROM "{name}"')).scalar()
            print(f"Bảng '{name}': {count} dòng")
            
            # Nếu có dữ liệu, kiểm tra xem có cột description hay không
            if count > 0:
                cols_sql = text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{name}'")
                cols = [c[0] for c in conn.execute(cols_sql).fetchall()]
                if 'description' in cols:
                    # Đếm "Chưa TT" trong bảng này
                    tt_count = conn.execute(text(f"SELECT count(*) FROM \"{name}\" WHERE description LIKE '%Chưa TT%'")).scalar()
                    print(f"  -> Có cột 'description'. Số dòng chứa 'Chưa TT': {tt_count}")
                elif 'note' in cols:
                    tt_count = conn.execute(text(f"SELECT count(*) FROM \"{name}\" WHERE note LIKE '%Chưa TT%'")).scalar()
                    print(f"  -> Có cột 'note'. Số dòng chứa 'Chưa TT': {tt_count}")

if __name__ == "__main__":
    inspect_htxsale()
