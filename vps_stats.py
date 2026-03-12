import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def stats():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        count = conn.execute(text("SELECT count(*) FROM orders")).scalar()
        print(f"Tổng số đơn hàng trên VPS: {count}")
        
        # Đã chuyển sang đếm theo cột status để chính xác với logic mới
        count_tt = conn.execute(text("SELECT count(*) FROM orders WHERE status = 'Chưa TT'")).scalar()
        print(f"Số đơn hàng 'Chưa TT' (Dựa trên status): {count_tt}")
        
        # Xem các loại payment_method hiện có
        pm_stats = conn.execute(text("SELECT payment_method, count(*) FROM orders GROUP BY payment_method")).fetchall()
        print("\nThống kê theo phương thức thanh toán:")
        for pm, c in pm_stats:
            print(f"- {pm or 'N/A'}: {c}")

if __name__ == "__main__":
    stats()
