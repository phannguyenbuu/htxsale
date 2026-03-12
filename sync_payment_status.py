from backend.app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # Sử dụng cột 'status' để đánh dấu Chưa TT, giữ nguyên payment_method gốc
        sql = "UPDATE orders SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL)"
        result = db.session.execute(text(sql))
        db.session.commit()
        print(f"Thành công: Đã cập nhật {result.rowcount} đơn hàng sang trạng thái 'Chưa TT'.")
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi cập nhật trạng thái: {e}")
