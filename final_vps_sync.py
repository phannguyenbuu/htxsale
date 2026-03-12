import sqlalchemy
from sqlalchemy import text

DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def final_sync():
    engine = sqlalchemy.create_engine(DB_URL)
    with engine.begin() as conn:
        print("Đang đồng bộ trạng thái thanh toán trên VPS...")
        # Sử dụng status thay vì payment_method để không ghi đè dữ liệu quan trọng
        sql = text("""
            UPDATE public.orders 
            SET "status" = 'Chưa TT' 
            WHERE "description" ILIKE '%Chưa TT%' 
            AND ("status" != 'Chưa TT' OR "status" IS NULL)
        """)
        result = conn.execute(sql)
        print(f"Cập nhật thành công {result.rowcount} đơn hàng sang trạng thái 'Chưa TT'.")
        
        # Kiểm tra lại 5 đơn hàng gần nhất có Chưa TT
        check = text("SELECT id, payment_method, status, description FROM public.orders WHERE description ILIKE '%Chưa TT%' ORDER BY created_at DESC LIMIT 5")
        rows = conn.execute(check).fetchall()
        if rows:
            print("\nKiểm tra dữ liệu sau cập nhật (Top 5):")
            for r in rows:
                print(f"ID: {r[0]} | PT Thanh Toán: {r[1]} | Trạng Thái: {r[2]} | Ghi chú: {r[3]}")

if __name__ == "__main__":
    final_sync()
