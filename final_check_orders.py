import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def final_check():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.connect() as conn:
        # 1. Đếm tổng số đơn hàng
        try:
            total = conn.execute(text("SELECT count(*) FROM orders")).scalar()
            print(f"Tổng số đơn hàng trong bảng 'orders': {total}")
            
            if total > 0:
                # 2. Tìm Chưa TT
                tt_count = conn.execute(text("SELECT count(*) FROM orders WHERE description ILIKE '%Chưa TT%'")).scalar()
                print(f"Số lượng đơn hàng có 'Chưa TT' trong description: {tt_count}")
                
                # 3. Xem các payment_method khác
                pms = conn.execute(text("SELECT payment_method, count(*) FROM orders GROUP BY payment_method")).fetchall()
                print("Các phương thức thanh toán:")
                for pm in pms:
                    print(f"  - {pm[0]}: {pm[1]}")
            else:
                # Thử bảng khác có thể chứa bill
                tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).fetchall()
                print(f"Bảng 'orders' trống. Các bảng khác trong DB: {[t[0] for t in tables]}")
        except Exception as e:
            print(f"Lỗi khi kiểm tra bảng 'orders': {e}")

if __name__ == "__main__":
    final_check()
