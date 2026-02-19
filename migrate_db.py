import sqlite3
import os
from backend.app import create_app
from backend.utils.extensions import db
from sqlalchemy import text

app = create_app()

with app.app_context():
    # Attempt to add the column using raw SQL via SQLAlchemy
    # SQLite supports ADD COLUMN
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE user ADD COLUMN membership_plan VARCHAR(50) DEFAULT '12 Months'"))
            conn.commit()
        print("Successfully added membership_plan column.")
    except Exception as e:
        print(f"Error adding column: {e}")
        # If it fails, maybe it already exists (but we checked it doesn't) or some other error.
