import os
from sqlalchemy import create_engine, text

# Sử dụng chính URL project đang dùng
DB_URL = "postgresql://postgres:myPass@localhost:5432/htxsale"

def debug_table():
    try:
        engine = create_engine(DB_URL)
        with engine.connect() as conn:
            print("--- CẤU TRÚC BẢNG ORDERS ---")
            # Query information_schema for more detail
            sql = text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'orders'
                ORDER BY ordinal_position
            """)
            rows = conn.execute(sql).fetchall()
            if not rows:
                print("Không tìm thấy bảng 'orders' trong database này!")
                return
                
            for r in rows:
                print(f"Cột: {r[0]} | Kiểu: {r[1]}")
                
    except Exception as e:
        print(f"Lỗi: {e}")

if __name__ == "__main__":
    debug_table()
