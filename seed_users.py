from backend.app import create_app
from backend.models.user import User
from backend.utils.extensions import bcrypt

app = create_app()

with app.app_context():
    # Check if admin exists
    admin_email = 'admin@nagarbhavi.com'
    existing_admin = User.find_by_email(admin_email)
    
    if not existing_admin:
        print(f"Creating admin user: {admin_email}")
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        User.create_user({
            'name': 'Admin User',
            'email': admin_email,
            'password': hashed_password, # In real app pass raw, but model might hash again? Let's check model.
            # Checking model: User.create_user inserts data directly. 
            # BUT auth_routes.py hashes it before calling create_user.
            # So here we must provide hashed password if using create_user directly?
            # actually let's look at User.create_user...
            # It just does mongo.db.users.insert_one(data).
            # So yes, we need to hash it here if we want it to work with login check_password_hash.
            'role': 'admin',
            'phone': '0000000000',
            'business_category': 'Administration'
        })
        # Wait, if I pass hashed password here, and auth_routes hashes it... 
        # In auth_routes: data['password'] = bcrypt.generate_password_hash...
        # So yes, we are simulating that.
        print("Admin user created.")
    else:
        print("Admin user already exists.")

    # Check if test member exists
    member_email = 'test@example.com'
    existing_member = User.find_by_email(member_email)

    if not existing_member:
        print(f"Creating member user: {member_email}")
        hashed_password = bcrypt.generate_password_hash('password123').decode('utf-8')
        User.create_user({
            'name': 'Test Member',
            'email': member_email,
            'password': hashed_password,
            'role': 'member',
            'phone': '1234567890',
            'business_category': 'Testing'
        })
        print("Member user created.")
    else:
        print("Member user already exists.")
