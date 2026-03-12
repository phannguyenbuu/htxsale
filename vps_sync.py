import sqlalchemy
from sqlalchemy import text

# Database identified as 'htxsale'
DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def sync():
    try:
        engine = sqlalchemy.create_engine(DB_URL)
        with engine.begin() as conn:
            print("Syncing payment status on VPS (DB: htxsale)...")
            
            # Update orders
            sql = text("UPDATE orders SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND status != 'Chưa TT'")
            result = conn.execute(sql)
            print(f"Successfully updated {result.rowcount} orders to 'Chưa TT'.")
            
            # Verify total
            total = conn.execute(text("SELECT count(*) FROM orders")).scalar()
            print(f"Total orders in 'htxsale': {total}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    sync()
