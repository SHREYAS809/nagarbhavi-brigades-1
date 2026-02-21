from backend.app import create_app
from backend.models import User
from backend.utils.extensions import db, bcrypt

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"Total Users: {len(users)}")
    for user in users:
        print(f"Checking User: {user.email}")
        # Test common passwords
        passwords = ['admin123', 'password123']
        match_found = False
        for p in passwords:
            if bcrypt.check_password_hash(user.password, p):
                print(f"  [SUCCESS] Password match for: {p}")
                match_found = True
                break
        if not match_found:
            print(f"  [FAILURE] Password does not match any common test passwords. Hash: {user.password}")
