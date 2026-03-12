import os
print("app.py is being loaded!")

import datetime
import json
import re
import uuid
from collections import defaultdict
from decimal import Decimal
from functools import wraps

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename

# --- CONFIG ---
app = Flask(__name__)
CORS(app)

# Ưu tiên kết nối trực tiếp localhost không qua Docker
database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:myPass@localhost:5432/htxsale')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads', 'bills')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- MODELS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')
    full_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))

class ProductType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    unit_price = db.Column(db.Numeric(12, 2), default=0)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    is_core = db.Column(db.Boolean, default=False)

class HtxProductSetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    htx_name = db.Column(db.String(100), nullable=False)
    product_code = db.Column(db.String(50), nullable=False)
    unit_price = db.Column(db.Numeric(12, 2), nullable=True)
    __table_args__ = (db.UniqueConstraint('htx_name', 'product_code', name='_htx_product_price_uc'),)

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    htx_name = db.Column(db.String(100), nullable=False)
    product_code = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    __table_args__ = (db.UniqueConstraint('htx_name', 'product_code', name='_htx_product_uc'),)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(50), primary_key=True)
    stt = db.Column(db.Integer)
    date = db.Column(db.Date)
    transfer_date = db.Column(db.Date)
    plate_number = db.Column(db.String(20))
    driver_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    htx = db.Column(db.String(100))
    description = db.Column(db.Text)
    amount = db.Column(db.Numeric(12, 2))
    service_type = db.Column(db.String(50))
    status = db.Column(db.String(20))
    payment_method = db.Column(db.String(50))
    sale_username = db.Column(db.String(80))
    bill_image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class OrderService(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), db.ForeignKey('orders.id'), nullable=False)
    service_type = db.Column(db.String(50))
    amount = db.Column(db.Numeric(12, 2))
    quantity = db.Column(db.Integer, default=1)

# --- ROUTES ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.password_hash == data.get('password'):
        return jsonify({'username': user.username, 'role': user.role, 'full_name': user.full_name})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/bills', methods=['GET'])
def admin_bills():
    sale_username = request.args.get('sale_username')
    htx = request.args.get('htx')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')

    query = Order.query
    if sale_username: query = query.filter(Order.sale_username.ilike(f"%{sale_username}%"))
    if htx: query = query.filter(Order.htx == htx)
    if date_from: query = query.filter(Order.date >= date_from)
    if date_to: query = query.filter(Order.date <= date_to)

    orders = query.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        services = OrderService.query.filter_by(order_id=o.id).all()
        result.append({
            'id': o.id,
            'date': o.date.isoformat() if o.date else None,
            'transfer_date': o.transfer_date.isoformat() if o.transfer_date else None,
            'htx': o.htx,
            'driver_name': o.driver_name,
            'phone': o.phone,
            'license_plate': o.plate_number,
            'payment_method': o.payment_method,
            'status': o.status,
            'bill_image_path': o.bill_image_path,
            'total_amount': int(o.amount or 0),
            'sale_username': o.sale_username,
            'item_details': {s.service_type: s.quantity for s in services},
            'created_at': o.created_at.isoformat(),
            'details': o.description
        })
    return jsonify(result)

@app.route('/api/admin/bills/manual', methods=['POST'])
def create_manual_bill():
    data = request.form
    image_file = request.files.get('bill_image')
    
    order_id = str(uuid.uuid4())[:8].upper()
    bill_image_path = None
    
    if image_file and image_file.filename:
        filename = secure_filename(f"{order_id}_{image_file.filename}")
        image_file.save(os.path.join(UPLOAD_FOLDER, filename))
        bill_image_path = f"/static/uploads/bills/{filename}"

    try: services = json.loads(data.get('services', '{}'))
    except: services = {}

    pm = data.get('payment_method')
    status = data.get('status')
    desc = data.get('note', '')
    
    if not status:
        status = 'paid'
        if desc and 'Chưa TT' in desc:
            status = 'Chưa TT'
        if pm == 'Chưa TT':
            status = 'Chưa TT'

    order = Order(
        id=order_id,
        date=datetime.date.today(),
        transfer_date=datetime.datetime.strptime(data.get('transfer_date'), '%Y-%m-%d').date() if data.get('transfer_date') else None,
        plate_number=data.get('license_plate'),
        driver_name=data.get('driver_name'),
        phone=data.get('phone'),
        htx=data.get('htx'),
        payment_method=pm,
        status=status,
        sale_username=data.get('sale_username'),
        amount=Decimal(data.get('amount', 0)),
        description=desc,
        bill_image_path=bill_image_path
    )
    db.session.add(order)

    for code, qty in services.items():
        if int(qty) <= 0: continue
        p_type = ProductType.query.filter_by(code=code).first()
        db.session.add(OrderService(order_id=order_id, service_type=code, amount=int(p_type.unit_price or 0) if p_type else 0, quantity=int(qty)))
        inv = InventoryItem.query.filter_by(htx_name=order.htx, product_code=code).first()
        if inv: inv.quantity -= int(qty)

    db.session.commit()
    return jsonify({'message': 'Manual bill created', 'id': order_id})

@app.route('/api/admin/bills/<id>', methods=['PUT', 'DELETE'])
def admin_edit_bill(id):
    order = Order.query.get_or_404(id)
    if request.method == 'DELETE':
        OrderService.query.filter_by(order_id=id).delete()
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Deleted'})

    data = request.form
    image_file = request.files.get('bill_image')

    if image_file and image_file.filename:
        filename = secure_filename(f"{id}_{image_file.filename}")
        image_file.save(os.path.join(UPLOAD_FOLDER, filename))
        order.bill_image_path = f"/static/uploads/bills/{filename}"

    order.plate_number = data.get('license_plate', order.plate_number)
    order.driver_name = data.get('driver_name', order.driver_name)
    order.phone = data.get('phone', order.phone)
    order.htx = data.get('htx', order.htx)
    order.payment_method = data.get('payment_method', order.payment_method)
    order.status = data.get('status', order.status)
    order.description = data.get('note', order.description)
    
    if order.description and 'Chưa TT' in order.description:
        order.status = 'Chưa TT'
    if order.payment_method == 'Chưa TT':
        order.status = 'Chưa TT'
    elif not order.status:
        order.status = 'paid'

    OrderService.query.filter_by(order_id=id).delete()
    try: services = json.loads(data.get('services', '{}'))
    except: services = {}
    for code, qty in services.items():
        if int(qty) <= 0: continue
        p_type = ProductType.query.filter_by(code=code).first()
        db.session.add(OrderService(order_id=id, service_type=code, amount=int(p_type.unit_price or 0) if p_type else 0, quantity=int(qty)))

    db.session.commit()
    return jsonify({'message': 'Updated'})

@app.route('/api/admin/inventory', methods=['GET', 'PUT'])
def admin_inventory():
    if request.method == 'GET':
        htx_rows = [{'id': i, 'name': h} for i, h in enumerate(["MINH VY", "THANH VY", "KIM THỊNH", "NGHĨA PHÁT", "MINH VY TIỀN GIANG"])]
        products = ProductType.query.order_by(ProductType.sort_order).all()
        stocks = InventoryItem.query.all()
        prices = HtxProductSetting.query.all()
        stock_data = defaultdict(dict)
        for s in stocks: stock_data[s.htx_name][s.product_code] = s.quantity
        price_data = defaultdict(dict)
        for p in prices: price_data[p.htx_name][p.product_code] = float(p.unit_price or 0)
        return jsonify({'htx_rows': htx_rows, 'products': [{'id': p.id, 'code': p.code, 'name': p.name, 'unit_price': int(p.unit_price or 0), 'is_active': p.is_active, 'sort_order': p.sort_order, 'is_core': p.is_core} for p in products], 'stocks': stock_data, 'prices': price_data})

    data = request.json or {}
    htx = data.get('htx')
    stocks = data.get('stocks', {})
    prices = data.get('prices', {})
    for code, qty in stocks.items():
        inv = InventoryItem.query.filter_by(htx_name=htx, product_code=code).first()
        if inv: inv.quantity = int(qty)
        else: db.session.add(InventoryItem(htx_name=htx, product_code=code, quantity=int(qty)))
    for code, price in prices.items():
        p_set = HtxProductSetting.query.filter_by(htx_name=htx, product_code=code).first()
        if p_set: p_set.unit_price = float(price)
        else: db.session.add(HtxProductSetting(htx_name=htx, product_code=code, unit_price=float(price)))
    db.session.commit()
    return jsonify({'message': 'Inventory updated'})

@app.route('/api/admin/sale_users', methods=['GET'])
def admin_sale_users():
    users = User.query.filter(User.role != 'admin').all()
    return jsonify([{'id': u.id, 'username': u.username, 'full_name': u.full_name, 'phone': u.phone, 'password': u.password_hash} for u in users])

@app.route('/api/admin/create_sale', methods=['POST'])
def create_sale():
    data = request.json or {}
    if User.query.filter_by(username=data.get('username')).first(): return jsonify({'error': 'Username exists'}), 400
    db.session.add(User(username=data.get('username'), password_hash=data.get('password', '123456'), full_name=data.get('full_name'), phone=data.get('phone'), role='user'))
    db.session.commit()
    return jsonify({'message': 'Sale user created'})

@app.route('/api/admin/sale_users/<int:user_id>', methods=['DELETE'])
def delete_sale_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/api/admin/drivers', methods=['GET'])
def admin_drivers():
    q = Order.query
    if request.args.get('htx'): q = q.filter(Order.htx == request.args.get('htx'))
    if request.args.get('query'):
        s = f"%{request.args.get('query')}%"
        q = q.filter((Order.driver_name.ilike(s)) | (Order.phone.ilike(s)) | (Order.plate_number.ilike(s)))
    
    # Fetch more to find valid names
    orders = q.order_by(Order.created_at.desc()).limit(500).all()
    
    seen_drivers = {}
    for o in orders:
        key = (o.phone or o.plate_number or o.id).strip().upper()
        if not key: continue
        
        # If new driver OR we found a better record (one with a name)
        if key not in seen_drivers or (not seen_drivers[key]['driver_name'] and o.driver_name):
            seen_drivers[key] = {
                'id': o.id,
                'driver_name': o.driver_name or '',
                'phone': o.phone or '',
                'license_plate': o.plate_number or '',
                'htx': o.htx,
                'last_order_date': o.date.isoformat() if o.date else None
            }
            
    return jsonify(list(seen_drivers.values()))

@app.route('/api/admin/products', methods=['GET', 'POST'])
def admin_products():
    if request.method == 'GET':
        products = ProductType.query.order_by(ProductType.sort_order).all()
        return jsonify([{'id': p.id, 'code': p.code, 'name': p.name, 'unit_price': int(p.unit_price or 0), 'is_active': p.is_active, 'sort_order': p.sort_order, 'is_core': p.is_core} for p in products])
    data = request.json or {}
    p = ProductType(code=data.get('code') or re.sub(r'[^a-z0-9]+', '_', data.get('name').lower()).strip('_'), name=data.get('name'), unit_price=data.get('unit_price', 0), is_active=data.get('is_active', True), sort_order=data.get('sort_order', 99))
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Product created'})

@app.route('/api/admin/products/<int:product_id>', methods=['PUT', 'DELETE'])
def admin_product_detail(product_id):
    product = ProductType.query.get_or_404(product_id)
    if request.method == 'DELETE':
        if product.is_core: return jsonify({'error': 'Core product'}), 400
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    data = request.json or {}
    if 'name' in data: product.name = data['name']
    if 'unit_price' in data: product.unit_price = data['unit_price']
    if 'is_active' in data: product.is_active = bool(data['is_active'])
    if 'sort_order' in data: product.sort_order = int(data['sort_order'])
    db.session.commit()
    return jsonify({'message': 'Updated'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8008)
