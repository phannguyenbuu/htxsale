import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def find_chua_tt_everywhere():
    print("--- TRUY TÌM CỤM TỪ 'Chưa TT' TRÊN TOÀN BỘ HỆ THỐNG ---")
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Lấy tất cả các bảng và cột có kiểu chuỗi
                sql_cols = text("""
                    SELECT table_name, column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public'
                    AND data_type IN ('text', 'character varying')
                """)
                columns = conn.execute(sql_cols).fetchall()
                
                for table, col in columns:
                    try:
                        search_sql = text(f'SELECT count(*) FROM "{table}" WHERE "{col}" ILIKE \'%Chưa TT%\'')
                        count = conn.execute(search_sql).scalar()
                        if count > 0:
                            print(f"==> PHÁT HIỆN: DB '{db_name}', Bảng '{table}', Cột '{col}' có {count} dòng.")
                    except:
                        continue
        except Exception:
            continue

if __name__ == "__main__":
    find_chua_tt_everywhere()
