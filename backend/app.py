import os
import datetime
from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import qrcode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
CORS(app)

# Database Configuration
# Default to local SQLite if Postgres URL is not provided
# Use 'postgresql://user:password@localhost:5432/HTXSale' for Docker
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/HTXSale')
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
    password_hash = db.Column(db.String(120), nullable=False)
    qr_token = db.Column(db.String(120), unique=True, nullable=True)
    role = db.Column(db.String(20), default='user') # 'admin' or 'user'

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
    details = db.Column(db.Text, nullable=True) # JSON string or details
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    driver = db.relationship('Driver', backref=db.backref('orders', lazy=True))

    def to_dict(self):
        data = {c.name: getattr(self, c.name) for c in self.__table__.columns}
        data['driver'] = self.driver.to_dict()
        return data

# Routes

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({'token': f"user-{user.id}", 'role': user.role, 'username': user.username})
    return jsonify({'error': 'Invalid credentials'}), 401

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
    data = request.json
    # Expecting: htx, driver_name, license_plate, phone, order_details
    htx = data.get('htx')
    name = data.get('driver_name')
    license_plate = data.get('license_plate')
    phone = data.get('phone')
    details = data.get('details')

    if not all([htx, name, license_plate, phone]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check for existing driver
    driver = Driver.query.filter_by(name=name, license_plate=license_plate, phone=phone).first()
    
    if not driver:
        # Create new driver
        new_driver_id = generate_id('D', htx)
        driver = Driver(id=new_driver_id, name=name, license_plate=license_plate, phone=phone, htx=htx)
        db.session.add(driver)
        db.session.flush() # Get ID if needed, but we set it manually
    
    # Create Order
    new_order_id = generate_id('B', htx)
    order = Order(id=new_order_id, driver_id=driver.id, htx=htx, details=str(details))
    db.session.add(order)
    
    # Notification logic (mock)
    # notify_admin(f"New Bill Up: {new_order_id} by {name}")

    # Check stock logic (mock - simplistic)
    # if stock_low(htx): notify_admin(f"Low stock for {htx}")

    db.session.commit()
    return jsonify({'message': 'Bill uploaded successfully', 'order_id': new_order_id, 'driver_id': driver.id}), 201

@app.route('/api/export_bill/<order_id>', methods=['GET'])
def export_bill(order_id):
    order = Order.query.get_or_404(order_id)
    
    # Generate QR Code
    qr_data = f"Order: {order.id}
Driver: {order.driver.name}
Plate: {order.driver.license_plate}
HTX: {order.htx}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")

    # Create Bill Image (POS Style)
    img_width = 400
    img_height = 600
    img = Image.new('RGB', (img_width, img_height), color='white')
    d = ImageDraw.Draw(img)
    
    # Draw Text (Need a font, using default if unavailable)
    try:
        font = ImageFont.truetype("arial.ttf", 15)
        title_font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
        title_font = ImageFont.load_default()

    d.text((10, 10), "RECEIPT", fill=(0,0,0), font=title_font)
    d.text((10, 40), f"HTX: {order.htx}", fill=(0,0,0), font=font)
    d.text((10, 60), f"Order ID: {order.id}", fill=(0,0,0), font=font)
    d.text((10, 80), f"Driver: {order.driver.name}", fill=(0,0,0), font=font)
    d.text((10, 100), f"Plate: {order.driver.license_plate}", fill=(0,0,0), font=font)
    d.text((10, 120), f"Date: {order.created_at}", fill=(0,0,0), font=font)
    d.text((10, 150), f"Details: {order.details}", fill=(0,0,0), font=font)

    # Paste QR Code
    qr_img = qr_img.resize((150, 150))
    img.paste(qr_img, (125, 400))

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
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])

@app.route('/api/htx_list', methods=['GET'])
def get_htx_list():
    return jsonify(HTX_LIST)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create default admin if not exists
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', password_hash=generate_password_hash('admin'), role='admin', qr_token='admin-qr-token')
            db.session.add(admin)
            db.session.commit()
            
    app.run(debug=True, host='0.0.0.0', port=5000)
