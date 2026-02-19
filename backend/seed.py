from backend.app import create_app
from backend.utils.extensions import db, bcrypt
from backend.models import User

app = create_app()

def seed_db():
    with app.app_context():
        # Create tables (if not already created by migrate)
        db.create_all()
        
        # Check if admin exists
        # Check if admin exists
        if not User.query.filter_by(email='admin@nagarbhavibrigades.com').first():
            # Create Admin User
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(
                name='Admin User',
                email='admin@nagarbhavibrigades.com',
                password=hashed_password,
                role='admin',
                chapter='Nagarbhavi Brigades',
                business_category='Administration',
                phone='9999999999'
            )
            db.session.add(admin)
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        # Check if test member exists
        if not User.query.filter_by(email='test@example.com').first():
            # Create Test Member
            hashed_password_member = bcrypt.generate_password_hash('password123').decode('utf-8')
            member = User(
                name='Test Member',
                email='test@example.com',
                password=hashed_password_member,
                role='member',
                chapter='Nagarbhavi Brigades',
                business_category='Software',
                phone='8888888888'
            )
            db.session.add(member)
            print("Test member created.")
        else:
            print("Test member already exists.")

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_db()
