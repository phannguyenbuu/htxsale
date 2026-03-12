import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"
SEARCH_NAME = "Nguyễn Văn Xiêm"

def find_and_update():
    print(f"--- ĐANG TRUY TÌM DỮ LIỆU CHỨA '{SEARCH_NAME}' ---")
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Get all tables in all schemas
                sql_cols = text("""
                    SELECT table_schema, table_name, column_name 
                    FROM information_schema.columns 
                    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
                    AND data_type IN ('text', 'character varying')
                """)
                cols = conn.execute(sql_cols).fetchall()
                
                for schema, table, col in cols:
                    try:
                        # Check if data exists
                        search_sql = text(f'SELECT count(*) FROM "{schema}"."{"table"}" WHERE "{col}" = \'{SEARCH_NAME}\'')
                        count = conn.execute(search_sql).scalar()
                        if count > 0:
                            print(f"==> DỮ LIỆU TẠI: DB '{db_name}', Bảng '{schema}.{table}'")
                            
                            # Update 'status' instead of 'payment_method' to preserve original payment method
                            try:
                                res = conn.execute(text(f"UPDATE \"{schema}\".\"{table}\" SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL)"))
                                if res.rowcount > 0: print(f"    Updated {res.rowcount} records (status col).")
                            except:
                                try:
                                    res = conn.execute(text(f"UPDATE \"{schema}\".\"{table}\" SET status = 'Chưa TT' WHERE details ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL)"))
                                    if res.rowcount > 0: print(f"    Updated {res.rowcount} records (status col via details).")
                                except:
                                    pass
                            
                            conn.commit()
                    except:
                        continue
        except:
            continue

if __name__ == "__main__":
    find_and_update()
