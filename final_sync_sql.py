import os
from sqlalchemy import create_engine, text

# Lấy URL từ biến môi trường hoặc dùng mặc định
database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:myPass@localhost:5432/htxsale')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

def run_update():
    try:
        engine = create_engine(database_url)
        with engine.begin() as conn:
            # Thực hiện cập nhật: Cập nhật status thay vì payment_method
            sql = text("UPDATE orders SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL)")
            result = conn.execute(sql)
            print(f"--- KẾT QUẢ CẬP NHẬT ---")
            print(f"Số lượng đơn hàng đã chuyển sang trạng thái 'Chưa TT': {result.rowcount}")
            
            # Kiểm tra tổng số đơn hàng có chữ Chưa TT
            check = conn.execute(text("SELECT count(*) FROM orders WHERE description ILIKE '%Chưa TT%'")).scalar()
            print(f"Tổng số đơn hàng có ghi chú 'Chưa TT' hiện tại: {check}")
            
    except Exception as e:
        print(f"Lỗi khi thực thi SQL: {e}")

if __name__ == "__main__":
    run_update()
