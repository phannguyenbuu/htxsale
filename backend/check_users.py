import app; from app import User; 
with app.app.app_context(): 
    users = User.query.all()
    print('Users in DB:', [u.username for u in users])
