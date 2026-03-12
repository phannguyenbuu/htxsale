import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"
SEARCH_VAL = "Nguyễn Văn Xiêm"

def global_scan():
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Tìm tất cả các bảng có dữ liệu
                sql_tables = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                tables = [r[0] for r in conn.execute(sql_tables).fetchall()]
                
                for table in tables:
                    try:
                        count = conn.execute(text(f'SELECT count(*) FROM "{table}"')).scalar()
                        if count > 0:
                            # Tìm trong tất cả các cột của bảng này
                            sql_cols = text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND data_type IN ('text', 'character varying')")
                            cols = [r[0] for r in conn.execute(sql_cols).fetchall()]
                            
                            for col in cols:
                                match = conn.execute(text(f'SELECT count(*) FROM "{table}" WHERE "{col}" ILIKE :val'), {"val": f"%{SEARCH_VAL}%"}).scalar()
                                if match > 0:
                                    print(f"!!! FOUND '{SEARCH_VAL}' in DB '{db_name}', Table '{table}', Column '{col}' ({match} rows)")
                                    
                                    # Kiểm tra 'Chưa TT' trong bảng này luôn
                                    for d_col in cols:
                                        tt_match = conn.execute(text(f'SELECT count(*) FROM "{table}" WHERE "{d_col}" ILIKE \'%Chưa TT%\'')).scalar()
                                        if tt_match > 0:
                                            print(f"    -> Also found 'Chưa TT' in column '{d_col}' ({tt_match} rows)")
                    except:
                        continue
        except:
            continue

if __name__ == "__main__":
    global_scan()
