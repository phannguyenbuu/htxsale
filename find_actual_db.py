import sqlalchemy
from sqlalchemy import text

DB_LIST = ["htxsale", "postgres", "odoo_db", "gis_db", "new_admake_chat", "admake_chat"]
CREDS = "postgresql://postgres:myPass@localhost:5432/"

def find_where_is_the_data():
    print("--- TÌM KIẾM DỮ LIỆU THỰC TẾ ---")
    for db_name in DB_LIST:
        url = CREDS + db_name
        try:
            engine = sqlalchemy.create_engine(url)
            with engine.connect() as conn:
                # Kiểm tra bảng orders
                sql = text("SELECT count(*) FROM orders")
                count = conn.execute(sql).scalar()
                if count > 0:
                    print(f"==> TÌM THẤY! Database '{db_name}' đang chứa {count} đơn hàng.")
                    # In thử 1 dòng để xác nhận
                    sample = conn.execute(text("SELECT driver_name, plate_number FROM orders LIMIT 1")).fetchone()
                    print(f"    Mẫu dữ liệu: Tài xế {sample[0]}, Biển số {sample[1]}")
                else:
                    print(f"Database '{db_name}': Bảng 'orders' tồn tại nhưng trống.")
        except Exception:
            print(f"Database '{db_name}': Không có bảng 'orders'.")

if __name__ == "__main__":
    find_where_is_the_data()
