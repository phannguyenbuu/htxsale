import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def search_text():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        # Get all text columns in htxsale
        sql = text("""
            SELECT table_schema, table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
            AND data_type IN ('text', 'character varying')
        """)
        cols = conn.execute(sql).fetchall()
        
        for schema, table, col in cols:
            try:
                search_sql = text(f'SELECT count(*) FROM "{schema}"."{table}" WHERE "{col}" ILIKE \'%Chưa TT%\'')
                count = conn.execute(search_sql).scalar()
                if count > 0:
                    print(f"MATCH FOUND: Table '{schema}.{table}', Column '{col}' has {count} rows with 'Chưa TT'")
                    # Let's see the payment_method column in this table if it exists
                    pm_check = text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND column_name = 'payment_method'")
                    has_pm = conn.execute(pm_check).fetchone()
                    if has_pm:
                        update_sql = text(f'UPDATE "{schema}"."{table}" SET payment_method = \'Chưa TT\' WHERE "{col}" ILIKE \'%Chưa TT%\' AND payment_method != \'Chưa TT\'')
                        res = conn.execute(update_sql)
                        # engine.begin() or conn.commit() needed
                        print(f"  -> Successfully updated {res.rowcount} rows in this table.")
            except:
                continue

if __name__ == "__main__":
    search_text()
