from backend.app import create_app
from backend.models import User
from backend.utils.extensions import db

app = create_app()

with app.app_context():
    users = User.query.all()
    updated_count = 0
    for user in users:
        lower_email = user.email.strip().lower()
        if user.email != lower_email:
            print(f"Updating {user.email} -> {lower_email}")
            user.email = lower_email
            updated_count += 1
    
    if updated_count > 0:
        db.session.commit()
    print(f"Migration complete. Total emails updated: {updated_count}")
