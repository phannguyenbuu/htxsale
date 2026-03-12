import os
from sqlalchemy import create_engine, text

database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:myPass@localhost:5432/htxsale')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

def run_fix():
    try:
        engine = create_engine(database_url)
        with engine.begin() as conn:
            # Sửa đổi quan trọng: Chỉ cập nhật status sang 'Chưa TT'
            # Giữ nguyên payment_method (phương thức thanh toán) của người dùng
            sql = text('UPDATE "orders" SET "status" = \'Chưa TT\' WHERE "description" ILIKE \'%Chưa TT%\' AND ("status" != \'Chưa TT\' OR "status" IS NULL)')
            result = conn.execute(sql)
            print(f"Cập nhật thành công {result.rowcount} đơn hàng sang trạng thái 'Chưa TT'.")
    except Exception as e:
        print(f"Lỗi khi thực thi đồng bộ: {e}")

if __name__ == "__main__":
    run_fix()
