import os
print("app.py is being loaded!")

import datetime
import uuid
from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text, func
import qrcode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
cors_allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'https://sale.quanlyhtx.com,http://localhost:5173,https://localhost:5173,http://127.0.0.1:5173'
    ).split(',')
    if origin.strip()
]
CORS(
    app,
    resources={r"/api/*": {"origins": cors_allowed_origins}},
    supports_credentials=True
)

# Database Configuration
# Default to local SQLite if Postgres URL is not provided
# Use 'postgresql://user:password@localhost:5432/HTXSale' for Docker
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:myPass@localhost:5432/htxsale')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Constants
HTX_LIST = [
    "MINH VY",
    "THANH VY",
    "KIM THỊNH",
    "NGHĨA PHÁT",
    "MINH VY TIỀN GIANG"
]

# Helper for ID Generation
def generate_id(prefix, htx_name):
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    # Clean HTX name for ID (remove spaces/special chars if needed, but prompt implies simple concatenation)
    # prompt: '-' + <tên HTX> + ngày giờ (phút giây)
    # Example: L-MINH VY-202310271030
    return f"{prefix}-{htx_name}-{timestamp}"

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    qr_token = db.Column(db.String(255), unique=True, nullable=True)
    role = db.Column(db.String(20), default='user') # 'admin' or 'user'
    full_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)

    def to_sale_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'phone': self.phone,
            'role': self.role
        }

class Htx(db.Model):
    __tablename__ = 'htx'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    logo_stock = db.Column(db.Integer, default=0)
    card_stock = db.Column(db.Integer, default=0)
    tshirt_stock = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'logo_stock': self.logo_stock,
            'card_stock': self.card_stock,
            'tshirt_stock': self.tshirt_stock
        }

class ProductPricing(db.Model):
    __tablename__ = 'product_pricing'
    id = db.Column(db.Integer, primary_key=True)
    logo_price = db.Column(db.Integer, default=50000)
    card_price = db.Column(db.Integer, default=50000)
    tshirt_price = db.Column(db.Integer, default=50000)

    def to_dict(self):
        return {
            'logo_price': int(self.logo_price or 0),
            'card_price': int(self.card_price or 0),
            'tshirt_price': int(self.tshirt_price or 0),
        }

class Logo(db.Model):
    id = db.Column(db.String, primary_key=True)
    htx = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Card(db.Model):
    id = db.Column(db.String, primary_key=True)
    htx = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Tshirt(db.Model):
    id = db.Column(db.String, primary_key=True)
    htx = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Sale(db.Model):
    id = db.Column(db.String, primary_key=True)
    htx = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    info = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Driver(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_plate = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    htx = db.Column(db.String(100), nullable=False) # Created under this HTX context

    # We need to enforce uniqueness of (name, license_plate, phone)
    __table_args__ = (db.UniqueConstraint('name', 'license_plate', 'phone', name='_driver_uc'),)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Order(db.Model):
    id = db.Column(db.String, primary_key=True)
    driver_id = db.Column(db.String, db.ForeignKey('driver.id'), nullable=False)
    htx = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    logo_qty = db.Column(db.Integer, default=0)
    card_qty = db.Column(db.Integer, default=0)
    tshirt_qty = db.Column(db.Integer, default=0)
    total_amount = db.Column(db.Integer, default=0)
    payment_method = db.Column(db.String(20), default='Chuyển Khoản')
    delivery_method = db.Column(db.String(40), nullable=True)
    delivery_address = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    driver = db.relationship('Driver', backref=db.backref('orders', lazy=True))

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        data['driver'] = self.driver.to_dict() if self.driver else {
            'name': 'N/A',
            'license_plate': 'N/A',
            'phone': 'N/A'
        }
        return data

class Bill(db.Model):
    __tablename__ = 'bill'
    id = db.Column(db.String, primary_key=True)  # B-<HTX>-<encoded time>
    htx = db.Column(db.String(100), nullable=False)
    driver_name = db.Column(db.String(100), nullable=False)
    license_plate = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    details = db.Column(db.Text, nullable=True)
    logo_qty = db.Column(db.Integer, default=0)
    card_qty = db.Column(db.Integer, default=0)
    tshirt_qty = db.Column(db.Integer, default=0)
    total_amount = db.Column(db.Integer, default=0)
    payment_method = db.Column(db.String(20), default='Chuyển Khoản')
    delivery_method = db.Column(db.String(40), nullable=True)
    delivery_address = db.Column(db.Text, nullable=True)
    sale_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    sale_username = db.Column(db.String(80), nullable=True)
    sale_name = db.Column(db.String(100), nullable=True)
    sale_phone = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), default='paid')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    sale_user = db.relationship('User', backref=db.backref('bills', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'htx': self.htx,
            'driver_name': self.driver_name,
            'license_plate': self.license_plate,
            'phone': self.phone,
            'details': self.details,
            'logo_qty': self.logo_qty,
            'card_qty': self.card_qty,
            'tshirt_qty': self.tshirt_qty,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'delivery_method': self.delivery_method,
            'delivery_address': self.delivery_address,
            'sale_user_id': self.sale_user_id,
            'sale_username': self.sale_username,
            'sale_name': self.sale_name,
            'sale_phone': self.sale_phone,
            'status': self.status,
            'created_at': self.created_at,
            'driver': {
                'name': self.driver_name,
                'license_plate': self.license_plate,
                'phone': self.phone
            }
        }

def ensure_order_schema():
    # Backward-compatible fix for old DB schema without migrations.
    # This prevents 500 errors like UndefinedColumn on existing deployments.
    statements = [
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS details TEXT',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS logo_qty INTEGER DEFAULT 0',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS card_qty INTEGER DEFAULT 0',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS tshirt_qty INTEGER DEFAULT 0',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT \'Chuyển Khoản\'',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(40)',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_address TEXT',
        'ALTER TABLE "order" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE'
    ]
    try:
        for stmt in statements:
            db.session.execute(text(stmt))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"ensure_order_schema error: {str(e)}")

def ensure_inventory_schema():
    statements = [
        'ALTER TABLE htx ADD COLUMN IF NOT EXISTS tshirt_stock INTEGER DEFAULT 0',
        'CREATE TABLE IF NOT EXISTS tshirt (id VARCHAR PRIMARY KEY, htx VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, quantity INTEGER DEFAULT 0, image_url VARCHAR(200))',
        'ALTER TABLE bill ADD COLUMN IF NOT EXISTS tshirt_qty INTEGER DEFAULT 0'
    ]
    try:
        for stmt in statements:
            db.session.execute(text(stmt))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"ensure_inventory_schema error: {str(e)}")

def ensure_user_schema():
    statements = [
        'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS full_name VARCHAR(100)',
        'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(20)'
    ]
    try:
        for stmt in statements:
            db.session.execute(text(stmt))
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"ensure_user_schema error: {str(e)}")

def generate_bill_id(htx_name):
    clean_htx = (htx_name or 'HTX').strip()
    now = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    suffix = uuid.uuid4().hex[:4].upper()
    return f"B-{clean_htx}-{now}{suffix}"

def get_pricing_row():
    row = ProductPricing.query.get(1)
    if not row:
        row = ProductPricing(id=1, logo_price=50000, card_price=50000, tshirt_price=50000)
        db.session.add(row)
        db.session.flush()
    return row

# Routes

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = (data.get('username') or '').strip()
        password = data.get('password')
        username_lc = username.lower()

        # Admin shortcut login for sale_admin panel
        if username_lc == 'admin' and password == 'admin123':
            return jsonify({'token': 'user-admin-shortcut', 'role': 'admin', 'username': 'admin'})

        # Temporary bypass for sale001 as requested
        if username_lc == 'sale001' and password == '123456':
            return jsonify({'token': "user-sale001-bypass", 'role': 'user', 'username': 'sale001'})

        user = User.query.filter(func.lower(User.username) == username_lc).first()
        if user and check_password_hash(user.password_hash, password):
            return jsonify({'token': f"user-{user.id}", 'role': user.role, 'username': user.username})
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

@app.route('/api/login/qr', methods=['POST'])
def login_qr():
    data = request.json
    token = data.get('token')
    user = User.query.filter_by(qr_token=token).first()
    if user:
         return jsonify({'token': f"user-{user.id}", 'role': user.role, 'username': user.username})
    return jsonify({'error': 'Invalid QR token'}), 401

# CRUD for Logos
@app.route('/api/logos', methods=['GET', 'POST'])
def handle_logos():
    if request.method == 'POST':
        data = request.json
        htx = data.get('htx')
        if htx not in HTX_LIST:
            return jsonify({'error': 'Invalid HTX'}), 400
        new_id = generate_id('L', htx)
        logo = Logo(id=new_id, htx=htx, name=data['name'], quantity=data.get('quantity', 0), image_url=data.get('image_url'))
        db.session.add(logo)
        db.session.commit()
        return jsonify(logo.to_dict()), 201
    else:
        logos = Logo.query.all()
        return jsonify([l.to_dict() for l in logos])

@app.route('/api/logos/<id>', methods=['PUT', 'DELETE'])
def update_logo(id):
    logo = Logo.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(logo)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    else:
        data = request.json
        logo.name = data.get('name', logo.name)
        logo.quantity = data.get('quantity', logo.quantity)
        logo.image_url = data.get('image_url', logo.image_url)
        db.session.commit()
        return jsonify(logo.to_dict())

# CRUD for Cards
@app.route('/api/cards', methods=['GET', 'POST'])
def handle_cards():
    if request.method == 'POST':
        data = request.json
        htx = data.get('htx')
        if htx not in HTX_LIST:
            return jsonify({'error': 'Invalid HTX'}), 400
        new_id = generate_id('T', htx)
        card = Card(id=new_id, htx=htx, name=data['name'], quantity=data.get('quantity', 0), image_url=data.get('image_url'))
        db.session.add(card)
        db.session.commit()
        return jsonify(card.to_dict()), 201
    else:
        cards = Card.query.all()
        return jsonify([c.to_dict() for c in cards])

@app.route('/api/cards/<id>', methods=['PUT', 'DELETE'])
def update_card(id):
    card = Card.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    else:
        data = request.json
        card.name = data.get('name', card.name)
        card.quantity = data.get('quantity', card.quantity)
        card.image_url = data.get('image_url', card.image_url)
        db.session.commit()
        return jsonify(card.to_dict())

# CRUD for Tshirts
@app.route('/api/tshirts', methods=['GET', 'POST'])
def handle_tshirts():
    if request.method == 'POST':
        data = request.json
        htx = data.get('htx')
        if htx not in HTX_LIST:
            return jsonify({'error': 'Invalid HTX'}), 400
        new_id = generate_id('A', htx)
        tshirt = Tshirt(id=new_id, htx=htx, name=data['name'], quantity=data.get('quantity', 0), image_url=data.get('image_url'))
        db.session.add(tshirt)
        db.session.commit()
        return jsonify(tshirt.to_dict()), 201
    else:
        tshirts = Tshirt.query.all()
        return jsonify([t.to_dict() for t in tshirts])

@app.route('/api/tshirts/<id>', methods=['PUT', 'DELETE'])
def update_tshirt(id):
    tshirt = Tshirt.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(tshirt)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    else:
        data = request.json
        tshirt.name = data.get('name', tshirt.name)
        tshirt.quantity = data.get('quantity', tshirt.quantity)
        tshirt.image_url = data.get('image_url', tshirt.image_url)
        db.session.commit()
        return jsonify(tshirt.to_dict())

# CRUD for Sales
@app.route('/api/sales', methods=['GET', 'POST'])
def handle_sales():
    if request.method == 'POST':
        data = request.json
        htx = data.get('htx')
        if htx not in HTX_LIST:
            return jsonify({'error': 'Invalid HTX'}), 400
        new_id = generate_id('S', htx)
        sale = Sale(id=new_id, htx=htx, name=data['name'], info=data.get('info'))
        db.session.add(sale)
        db.session.commit()
        return jsonify(sale.to_dict()), 201
    else:
        sales = Sale.query.all()
        return jsonify([s.to_dict() for s in sales])

@app.route('/api/sales/<id>', methods=['PUT', 'DELETE'])
def update_sale(id):
    sale = Sale.query.get_or_404(id)
    if request.method == 'DELETE':
        db.session.delete(sale)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    else:
        data = request.json
        sale.name = data.get('name', sale.name)
        sale.info = data.get('info', sale.info)
        db.session.commit()
        return jsonify(sale.to_dict())

# Up Bill Logic
@app.route('/api/up_bill', methods=['POST'])
def up_bill():
    try:
        data = request.json or {}
        print(f"DEBUG: up_bill received data: {data}")
        # Expecting: htx, driver_name, license_plate, phone, order_details
        htx = data.get('htx')
        name = data.get('driver_name') or "N/A"
        license_plate = data.get('license_plate') or "N/A"
        phone = data.get('phone') or "N/A"
        details = data.get('details') or ""
        logo_qty = int(data.get('logo_qty', 0))
        card_qty = int(data.get('card_qty', 0))
        tshirt_qty = int(data.get('tshirt_qty', 0))
        pricing = get_pricing_row().to_dict()
        total_amount = (
            logo_qty * int(pricing.get('logo_price', 0)) +
            card_qty * int(pricing.get('card_price', 0)) +
            tshirt_qty * int(pricing.get('tshirt_price', 0))
        )
        payment_method = data.get('payment_method') or "Chuyển Khoản"
        delivery_method = data.get('delivery_method') or None
        delivery_address = data.get('delivery_address') or None
        sale_username = data.get('sale_username') or None
        bill_id = data.get('bill_id') or generate_bill_id(htx)

        if not htx:
            return jsonify({'error': 'Missing HTX'}), 400
        if logo_qty < 0 or card_qty < 0 or tshirt_qty < 0 or total_amount < 0:
            return jsonify({'error': 'Invalid quantity or amount'}), 400

        # Update HTX stock (single source of truth for home inventory)
        htx_row = Htx.query.filter_by(name=htx).first()
        if not htx_row:
            htx_row = Htx(name=htx, logo_stock=0, card_stock=0)
            db.session.add(htx_row)
            db.session.flush()

        if logo_qty > 0:
            if htx_row.logo_stock < logo_qty:
                return jsonify({'error': 'Insufficient logo stock'}), 400
            htx_row.logo_stock -= logo_qty
        if card_qty > 0:
            if htx_row.card_stock < card_qty:
                return jsonify({'error': 'Insufficient card stock'}), 400
            htx_row.card_stock -= card_qty
        if tshirt_qty > 0:
            if htx_row.tshirt_stock < tshirt_qty:
                return jsonify({'error': 'Insufficient tshirt stock'}), 400
            htx_row.tshirt_stock -= tshirt_qty

        # Keep legacy stock tables in sync (optional compatibility)
        logo = Logo.query.filter_by(htx=htx).first()
        if logo:
            logo.quantity = htx_row.logo_stock
        card = Card.query.filter_by(htx=htx).first()
        if card:
            card.quantity = htx_row.card_stock
        tshirt = Tshirt.query.filter_by(htx=htx).first()
        if tshirt:
            tshirt.quantity = htx_row.tshirt_stock

        # Check for existing driver
        driver = Driver.query.filter_by(name=name, license_plate=license_plate, phone=phone).first()

        if not driver:
            # Create new driver
            new_driver_id = generate_id('D', htx)
            driver = Driver(id=new_driver_id, name=name, license_plate=license_plate, phone=phone, htx=htx)
            db.session.add(driver)
            db.session.flush()  # Ensure driver.id exists before creating order

        sale_user = User.query.filter_by(username=sale_username).first() if sale_username else None

        if Bill.query.get(bill_id):
            bill_id = generate_bill_id(htx)

        # Create Bill (main table)
        bill = Bill(
            id=bill_id,
            htx=htx,
            driver_name=name,
            license_plate=license_plate,
            phone=phone,
            details=str(details),
            logo_qty=logo_qty,
            card_qty=card_qty,
            tshirt_qty=tshirt_qty,
            total_amount=total_amount,
            payment_method=payment_method,
            delivery_method=delivery_method,
            delivery_address=delivery_address,
            sale_user_id=sale_user.id if sale_user else None,
            sale_username=sale_user.username if sale_user else sale_username,
            sale_name=sale_user.full_name if sale_user else None,
            sale_phone=sale_user.phone if sale_user else None,
            status='paid'
        )
        db.session.add(bill)

        # Keep legacy Order table for backward compatibility
        order = Order(
            id=bill_id,
            driver_id=driver.id,
            htx=htx,
            details=str(details),
            logo_qty=logo_qty,
            card_qty=card_qty,
            tshirt_qty=tshirt_qty,
            total_amount=total_amount,
            payment_method=payment_method,
            delivery_method=delivery_method,
            delivery_address=delivery_address
        )
        db.session.merge(order)

        db.session.commit()
        return jsonify({'message': 'Bill uploaded successfully', 'order_id': bill_id}), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"up_bill error: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    htx = request.args.get('htx')
    if not htx:
        return jsonify({'error': 'Missing HTX'}), 400
    htx_row = Htx.query.filter_by(name=htx).first()
    logo_qty = htx_row.logo_stock if htx_row else 0
    card_qty = htx_row.card_stock if htx_row else 0
    tshirt_qty = htx_row.tshirt_stock if htx_row else 0
    return jsonify({
        'logo': {'quantity': logo_qty},
        'card': {'quantity': card_qty},
        'tshirt': {'quantity': tshirt_qty}
    })

@app.route('/api/pricing', methods=['GET'])
def get_pricing():
    row = get_pricing_row()
    db.session.commit()
    return jsonify(row.to_dict())

@app.route('/api/export_bill/<order_id>', methods=['GET'])
def export_bill(order_id):
    bill = Bill.query.get_or_404(order_id)
    
    # Generate QR Code
    qr_data = f"""Order: {bill.id}
Driver: {bill.driver_name}
Plate: {bill.license_plate}
HTX: {bill.htx}"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    # Create Bill Image (POS Style)
    img_width = 500
    img_height = 800
    img = Image.new('RGB', (img_width, img_height), color='white')
    d = ImageDraw.Draw(img)
    
    # Use DejaVuSans for Vietnamese support
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    try:
        font = ImageFont.truetype(font_path, 22)
        title_font = ImageFont.truetype(font_path, 30)
    except IOError:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()

    d.text((20, 20), "BIÊN LAI BÁN HÀNG", fill=(0,0,0), font=title_font)
    d.text((20, 70), f"HTX: {bill.htx}", fill=(0,0,0), font=font)
    d.text((20, 105), f"Mã đơn: {bill.id}", fill=(0,0,0), font=font)
    d.text((20, 140), f"Tài xế: {bill.driver_name}", fill=(0,0,0), font=font)
    d.text((20, 175), f"Biển số: {bill.license_plate}", fill=(0,0,0), font=font)
    d.text((20, 210), f"Ngày: {bill.created_at.strftime('%d/%m/%Y %H:%M')}", fill=(0,0,0), font=font)
    
    y = 260
    d.line((20, y, 480, y), fill=(0,0,0), width=2)
    y += 20
    
    if bill.logo_qty > 0:
        d.text((20, y), f"Logo: {bill.logo_qty} cái", fill=(0,0,0), font=font)
        y += 35
    if bill.card_qty > 0:
        d.text((20, y), f"Thẻ: {bill.card_qty} cái", fill=(0,0,0), font=font)
        y += 35
    if bill.tshirt_qty > 0:
        d.text((20, y), f"Áo thun: {bill.tshirt_qty} cái", fill=(0,0,0), font=font)
        y += 35
        
    d.text((20, y), f"Ghi chú: {bill.details}", fill=(0,0,0), font=font)
    y += 50
    
    d.line((20, y, 480, y), fill=(0,0,0), width=2)
    y += 20
    d.text((20, y), f"THÀNH TIỀN: {bill.total_amount:,} đ", fill=(0,0,0), font=title_font)

    # Paste QR Code
    qr_img = qr_img.resize((200, 200))
    img.paste(qr_img, (150, y + 60))

    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    return send_file(img_io, mimetype='image/png')

@app.route('/api/search_driver', methods=['GET'])
def search_driver():
    # Autofill logic
    license_plate = request.args.get('license_plate')
    phone = request.args.get('phone')
    name = request.args.get('name')
    
    query = Driver.query
    if license_plate:
        query = query.filter(Driver.license_plate.like(f"%{license_plate}%"))
    if phone:
        query = query.filter(Driver.phone.like(f"%{phone}%"))
    if name:
        query = query.filter(Driver.name.like(f"%{name}%"))
        
    results = query.all()
    return jsonify([d.to_dict() for d in results])

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        sale_username = request.args.get('sale_username')
        query = Bill.query
        if sale_username:
            query = query.filter(Bill.sale_username == sale_username)
        bills = query.order_by(Bill.created_at.desc()).all()
        return jsonify([b.to_dict() for b in bills])
    except Exception as e:
        app.logger.error(f"get_orders error: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    bill = Bill.query.get_or_404(order_id)
    return jsonify(bill.to_dict())

# sale_admin endpoints
@app.route('/api/admin/inventory', methods=['GET', 'PUT'])
def admin_inventory():
    if request.method == 'GET':
        rows = Htx.query.order_by(Htx.name.asc()).all()
        return jsonify([r.to_dict() for r in rows])

    data = request.json or {}
    htx_name = data.get('htx')
    if not htx_name:
        return jsonify({'error': 'Missing HTX'}), 400

    logo_stock = data.get('logo_stock')
    card_stock = data.get('card_stock')
    tshirt_stock = data.get('tshirt_stock')
    if logo_stock is None or card_stock is None or tshirt_stock is None:
        return jsonify({'error': 'Missing stock values'}), 400

    try:
        logo_stock = int(logo_stock)
        card_stock = int(card_stock)
        tshirt_stock = int(tshirt_stock)
    except Exception:
        return jsonify({'error': 'Invalid stock values'}), 400

    if logo_stock < 0 or card_stock < 0 or tshirt_stock < 0:
        return jsonify({'error': 'Stock cannot be negative'}), 400

    row = Htx.query.filter_by(name=htx_name).first()
    if not row:
        row = Htx(name=htx_name, logo_stock=logo_stock, card_stock=card_stock, tshirt_stock=tshirt_stock)
        db.session.add(row)
    else:
        row.logo_stock = logo_stock
        row.card_stock = card_stock
        row.tshirt_stock = tshirt_stock

    # sync legacy stock tables
    logo = Logo.query.filter_by(htx=htx_name).first()
    card = Card.query.filter_by(htx=htx_name).first()
    if logo:
        logo.quantity = logo_stock
    if card:
        card.quantity = card_stock
    tshirt = Tshirt.query.filter_by(htx=htx_name).first()
    if tshirt:
        tshirt.quantity = tshirt_stock

    db.session.commit()
    return jsonify({'message': 'Inventory updated', 'item': row.to_dict()})

@app.route('/api/admin/pricing', methods=['GET', 'PUT'])
def admin_pricing():
    if request.method == 'GET':
        row = get_pricing_row()
        db.session.commit()
        return jsonify(row.to_dict())

    data = request.json or {}
    try:
        logo_price = int(data.get('logo_price', 0))
        card_price = int(data.get('card_price', 0))
        tshirt_price = int(data.get('tshirt_price', 0))
    except Exception:
        return jsonify({'error': 'Invalid price values'}), 400

    if logo_price < 0 or card_price < 0 or tshirt_price < 0:
        return jsonify({'error': 'Price cannot be negative'}), 400

    row = get_pricing_row()
    row.logo_price = logo_price
    row.card_price = card_price
    row.tshirt_price = tshirt_price
    db.session.commit()
    return jsonify({'message': 'Pricing updated', 'item': row.to_dict()})

@app.route('/api/admin/bills', methods=['GET'])
def admin_bills():
    sale_username = request.args.get('sale_username')
    date_from = request.args.get('date_from')  # YYYY-MM-DD
    date_to = request.args.get('date_to')      # YYYY-MM-DD

    query = Bill.query
    if sale_username:
        query = query.filter(Bill.sale_username == sale_username)
    if date_from:
        try:
            start = datetime.datetime.strptime(date_from, "%Y-%m-%d")
            query = query.filter(Bill.created_at >= start)
        except ValueError:
            return jsonify({'error': 'Invalid date_from format'}), 400
    if date_to:
        try:
            end = datetime.datetime.strptime(date_to, "%Y-%m-%d") + datetime.timedelta(days=1)
            query = query.filter(Bill.created_at < end)
        except ValueError:
            return jsonify({'error': 'Invalid date_to format'}), 400

    bills = query.order_by(Bill.created_at.desc()).all()
    return jsonify([b.to_dict() for b in bills])

@app.route('/api/admin/drivers', methods=['GET'])
def admin_drivers():
    query_text = (request.args.get('query') or '').strip()
    q = Driver.query
    if query_text:
        like = f"%{query_text}%"
        q = q.filter(
            (Driver.name.ilike(like)) |
            (Driver.license_plate.ilike(like)) |
            (Driver.phone.ilike(like))
        )
    drivers = q.order_by(Driver.id.desc()).limit(300).all()
    return jsonify([d.to_dict() for d in drivers])

@app.route('/api/admin/sale_users', methods=['GET', 'POST'])
def admin_sale_users():
    if request.method == 'GET':
        users = User.query.filter_by(role='user').order_by(User.id.asc()).all()
        return jsonify([u.to_sale_dict() for u in users])

    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    full_name = data.get('full_name') or None
    phone = data.get('phone') or None

    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    user = User(
        username=username,
        password_hash=generate_password_hash(password or '123456'),
        role='user',
        full_name=full_name,
        phone=phone
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_sale_dict()), 201

@app.route('/api/admin/sale_users/<int:user_id>', methods=['PUT', 'DELETE'])
def admin_sale_user_detail(user_id):
    user = User.query.get_or_404(user_id)
    if user.role != 'user':
        return jsonify({'error': 'Only sale users are allowed here'}), 400

    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Deleted'})

    data = request.json or {}
    new_username = (data.get('username') or user.username).strip()
    if new_username != user.username:
        if User.query.filter(User.username == new_username, User.id != user.id).first():
            return jsonify({'error': 'Username already exists'}), 400
        user.username = new_username

    user.full_name = data.get('full_name', user.full_name)
    user.phone = data.get('phone', user.phone)
    new_password = data.get('password')
    if new_password:
        user.password_hash = generate_password_hash(new_password)

    db.session.commit()
    return jsonify(user.to_sale_dict())

@app.route('/api/htx_list', methods=['GET'])
def get_htx_list():
    htx_rows = Htx.query.order_by(Htx.name.asc()).all()
    return jsonify([h.name for h in htx_rows])

@app.route('/test')
def test_route():
    return "Test route is working!"


with app.app_context():
    db.create_all()
    ensure_order_schema()
    ensure_user_schema()
    ensure_inventory_schema()
    get_pricing_row()
    # Create default admin if not exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(username='admin', password_hash=generate_password_hash('123456'), role='admin', qr_token='admin-qr-token')
        db.session.add(admin_user)
    else:
        # Keep default admin credential aligned with requested login: admin / 123456
        admin_user.password_hash = generate_password_hash('123456')
        admin_user.role = 'admin'
    
    # Initialize HTX stock table
    for htx in HTX_LIST:
        htx_row = Htx.query.filter_by(name=htx).first()
        if not htx_row:
            htx_row = Htx(name=htx, logo_stock=100, card_stock=100, tshirt_stock=100)
            db.session.add(htx_row)

    # Initialize legacy Logo/Card tables and keep synced with HTX stock
    for htx in HTX_LIST:
        htx_row = Htx.query.filter_by(name=htx).first()
        if not Logo.query.filter_by(htx=htx).first():
            db.session.add(Logo(id=f"L-{htx}-INIT", htx=htx, name=f"Logo {htx}", quantity=htx_row.logo_stock if htx_row else 100))
        if not Card.query.filter_by(htx=htx).first():
            db.session.add(Card(id=f"C-{htx}-INIT", htx=htx, name=f"Card {htx}", quantity=htx_row.card_stock if htx_row else 100))
        if not Tshirt.query.filter_by(htx=htx).first():
            db.session.add(Tshirt(id=f"A-{htx}-INIT", htx=htx, name=f"Tshirt {htx}", quantity=htx_row.tshirt_stock if htx_row else 100))

        logo = Logo.query.filter_by(htx=htx).first()
        card = Card.query.filter_by(htx=htx).first()
        tshirt = Tshirt.query.filter_by(htx=htx).first()
        if htx_row and logo and card and tshirt:
            # If HTX stock was newly created and legacy has data, adopt legacy once.
            if htx_row.logo_stock == 100 and logo.quantity != 100:
                htx_row.logo_stock = logo.quantity
            if htx_row.card_stock == 100 and card.quantity != 100:
                htx_row.card_stock = card.quantity
            if htx_row.tshirt_stock == 100 and tshirt.quantity != 100:
                htx_row.tshirt_stock = tshirt.quantity
            logo.quantity = htx_row.logo_stock
            card.quantity = htx_row.card_stock
            tshirt.quantity = htx_row.tshirt_stock
            
    db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8008)
