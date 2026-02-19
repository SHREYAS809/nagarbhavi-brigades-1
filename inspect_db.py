from backend.app import create_app
from backend.utils.extensions import db
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    inspector = inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('user')]
    print(f"User columns: {columns}")
    
    if 'membership_plan' in columns:
        print("SUCCESS: membership_plan column exists.")
    else:
        print("FAILURE: membership_plan column MISSING.")
