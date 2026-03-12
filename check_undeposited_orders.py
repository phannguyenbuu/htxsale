from backend.app import app, db, Order
from sqlalchemy import text

with app.app_context():
    # Kiểm tra tổng số record
    total = db.session.query(Order).count()
    print(f"Tổng số record trong bảng orders: {total}")

    # Lấy 10 record đầu tiên
    first_10 = db.session.query(Order).limit(10).all()
    print("\n--- 10 record đầu tiên ---")
    for o in first_10:
        print(f"ID: {o.id} | Desc: {o.description} | PM: {o.payment_method}")

    # Kiểm tra payment_method có giá trị nào khác không
    methods = db.session.query(Order.payment_method).distinct().all()
    print(f"\nCác phương thức thanh toán hiện có: {[m[0] for m in methods]}")
