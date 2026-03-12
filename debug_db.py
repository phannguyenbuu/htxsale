from backend.app import app, db, Order
from sqlalchemy import text

with app.app_context():
    # Check total
    count = Order.query.count()
    print(f"Total orders: {count}")
    
    # Check samples with description
    samples = Order.query.filter(Order.description != None).limit(10).all()
    for s in samples:
        print(f"ID: {s.id} | Desc: [{s.description}] | PM: {s.payment_method}")
