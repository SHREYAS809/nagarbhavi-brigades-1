from backend.app import create_app
from backend.models import User
from backend.utils.extensions import bcrypt

app = create_app()

def verify_user(email, password):
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"User {email} NOT FOUND.")
            return False
            
        print(f"User found: {user.email}, Role: {user.role}")
        if bcrypt.check_password_hash(user.password, password):
            print("Password check: VALID")
            return True
        else:
            print("Password check: INVALID")
            # Debugging: Generate a new hash to see what it should look like
            new_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            print(f"Stored hash: {user.password}")
            print(f"New hash for '{password}': {new_hash}")
            return False

if __name__ == '__main__':
    print("--- Verifying Admin ---")
    verify_user('admin@nagarbhavibrigades.com', 'admin123')
    
    print("\n--- Verifying Member ---")
    verify_user('test@example.com', 'password123')
