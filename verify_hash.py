from backend.app import create_app
from backend.models import User
from backend.utils.extensions import db, bcrypt

app = create_app()

with app.app_context():
    users = User.query.all()
    print(f"Total Users: {len(users)}")
    print("-" * 50)
    print(f"{'ID':<5} | {'Email (Exact)':<30} | {'Password Match'}")
    print("-" * 50)
    
    for user in users:
        # Test common passwords
        passwords = ['admin123', 'password123', 'manoj123', 'rahul123']
        match = "No Match"
        for p in passwords:
            try:
                if bcrypt.check_password_hash(user.password, p):
                    match = f"Match: {p}"
                    break
            except:
                match = "Invalid Hash"
        
        print(f"{user.id:<5} | {user.email:<30} | {match}")
