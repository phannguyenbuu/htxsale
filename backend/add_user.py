import app; from app import User, db; from werkzeug.security import generate_password_hash;
with app.app.app_context():
    if not User.query.filter_by(username='sale001').first():
        u = User(username='sale001', password_hash=generate_password_hash('123456'), role='user', qr_token='sale001-qr-token')
        db.session.add(u)
        db.session.commit()
        print('User sale001 created successfully with password 123456')
