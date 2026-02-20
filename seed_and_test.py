from backend.app import create_app
from backend.models import User
from backend.utils.extensions import db, bcrypt

app = create_app()

with app.app_context():
    # Create DB if not exists
    db.create_all()
    
    admin_email = 'admin@nagarbhavi.com'
    existing = User.query.filter_by(email=admin_email).first()
    if not existing:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        admin = User(
            name='Admin User',
            email=admin_email,
            password=hashed_password,
            role='admin',
            phone='0000000000',
            business_category='Administration'
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created")
    else:
        print("Admin user exists")

# Run test API
import test_dashboard
test_dashboard.test()
