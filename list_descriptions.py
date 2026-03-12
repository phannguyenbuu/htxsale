import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def list_all_descriptions():
    found_any = False
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Tìm các bảng có cột 'description'
                sql = text("""
                    SELECT table_name 
                    FROM information_schema.columns 
                    WHERE column_name = 'description' 
                    AND table_schema = 'public'
                """)
                tables = conn.execute(sql).fetchall()
                for (table_name,) in tables:
                    try:
                        # Lấy dữ liệu từ cột description
                        data_sql = text(f'SELECT description FROM "{table_name}" WHERE description IS NOT NULL AND description != \'\'')
                        rows = conn.execute(data_sql).fetchall()
                        if rows:
                            found_any = True
                            print(f"\n=== DATABASE: {db_name} | TABLE: {table_name} ===")
                            for i, r in enumerate(rows, 1):
                                print(f"{i}. {r[0]}")
                    except:
                        continue
        except:
            continue
    
    if not found_any:
        print("Không tìm thấy dữ liệu nào trong cột 'description' ở bất kỳ database nào.")

if __name__ == "__main__":
    list_all_descriptions()
