import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def deep_search():
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Get all tables in all schemas that might be an order table
                sql = text("""
                    SELECT table_schema, table_name 
                    FROM information_schema.tables 
                    WHERE table_name ILIKE '%order%'
                    AND table_schema NOT IN ('information_schema', 'pg_catalog')
                """)
                tables = conn.execute(sql).fetchall()
                for schema, table in tables:
                    try:
                        # Attempt update using 'status' instead of 'payment_method'
                        # This avoids overwriting the actual payment method content
                        update_sql = text(f'UPDATE "{schema}"."{table}" SET status = \'Chưa TT\' WHERE description ILIKE \'%Chưa TT%\' AND (status != \'Chưa TT\' OR status IS NULL)')
                        res = conn.execute(update_sql)
                        conn.commit()
                        if res.rowcount > 0:
                            print(f"DONE: Updated {res.rowcount} records in {db_name}.{schema}.{table} to status 'Chưa TT'")
                    except:
                        # Column 'status' might not exist, skip
                        continue
        except:
            continue

if __name__ == "__main__":
    deep_search()
