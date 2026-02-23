from flask import Flask, jsonify
from flask_cors import CORS
from backend.config.config import Config
from backend.utils.extensions import bcrypt, mail
from backend.routes.auth_routes import auth_bp
from backend.routes.referral_routes import referral_bp
from backend.routes.revenue_routes import revenue_bp
from backend.routes.meeting_routes import meeting_bp
from backend.routes.event_routes import event_bp
from backend.routes.notification_routes import notification_bp
from backend.routes.user_routes import user_bp
from backend.routes.guest_routes import guest_bp
from backend.routes.learning_routes import learning_bp
from backend.routes.analytics_routes import analytics_bp
from backend.routes.search_routes import search_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    # Initialize Extensions
    # mongo.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    
    import os
    from backend.utils.extensions import db, migrate
    db.init_app(app)
    
    # Render starts gunicorn in backend/wsgi.py which might mess up relative paths
    # Set the exact path to the migrations folder at the root project level
    migrations_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'migrations'))
    migrate.init_app(app, db, directory=migrations_dir)
    
    # Auto-upgrade the database
    with app.app_context():
        try:
            from flask_migrate import upgrade
            upgrade(directory=migrations_dir)
        except Exception as e:
            print(f"Auto-upgrade failed: {e}")
            
        # BULLETPROOF FALLBACK: Violently force the column creation if migrate failed
        try:
            from sqlalchemy import text
            # Add missing columns to 'user' table
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS business_name VARCHAR(100)"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS business_category VARCHAR(100)"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS services_offered TEXT"))
            db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS photo TEXT"))
            
            # Add missing columns to 'revenue' table
            db.session.execute(text("ALTER TABLE revenue ADD COLUMN IF NOT EXISTS appreciation_message TEXT"))
            db.session.execute(text("ALTER TABLE revenue ADD COLUMN IF NOT EXISTS appreciation_reason TEXT"))
            
            # Add missing columns to 'referral' table
            db.session.execute(text("ALTER TABLE referral ADD COLUMN IF NOT EXISTS referral_type VARCHAR(20) DEFAULT 'Others'"))
            
            db.session.execute(text("ALTER TABLE meeting ADD COLUMN IF NOT EXISTS organized_by INTEGER REFERENCES \"user\"(id)"))
            db.session.execute(text("ALTER TABLE meeting ADD COLUMN IF NOT EXISTS meeting_mode VARCHAR(20) DEFAULT 'Offline'"))
            db.session.execute(text("ALTER TABLE meeting ADD COLUMN IF NOT EXISTS meet_link VARCHAR(500)"))
            
            # Create missing tables if they don't exist
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS one_to_one (
                    id SERIAL PRIMARY KEY,
                    member_id INTEGER NOT NULL REFERENCES \"user\"(id),
                    with_member_id INTEGER NOT NULL REFERENCES \"user\"(id),
                    date VARCHAR(20),
                    location VARCHAR(200),
                    topics_discussed TEXT,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS meeting_attendees (
                    user_id INTEGER NOT NULL REFERENCES \"user\"(id),
                    meeting_id INTEGER NOT NULL REFERENCES meeting(id),
                    PRIMARY KEY (user_id, meeting_id)
                )
            """))
            
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS event (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(100) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            db.session.execute(text("""
                CREATE TABLE IF NOT EXISTS event_attendees (
                    user_id INTEGER NOT NULL REFERENCES \"user\"(id),
                    event_id INTEGER NOT NULL REFERENCES event(id),
                    PRIMARY KEY (user_id, event_id)
                )
            """))
            
            db.session.commit()
            print("Successfully verified/added all missing columns via raw SQL fallback.")
        except Exception as e2:
            db.session.rollback()
            print(f"Raw SQL fallback failed: {e2}")
            
        # NORMALIZE EMAILS: Ensure all existing emails are lowercase for consistency
        try:
            from backend.models import User
            users = User.query.all()
            for u in users:
                if u.email and u.email != u.email.lower():
                    u.email = u.email.lower()
            db.session.commit()
            print("Successfully normalized all emails to lowercase.")
        except Exception as e3:
            db.session.rollback()
            print(f"Email normalization failed: {e3}")
    
    CORS(app) # Enable CORS for all routes

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(referral_bp, url_prefix='/api/referrals')
    app.register_blueprint(revenue_bp, url_prefix='/api/revenue')
    app.register_blueprint(meeting_bp, url_prefix='/api/meetings')
    app.register_blueprint(event_bp, url_prefix='/api/events')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(guest_bp, url_prefix='/api/guests')
    app.register_blueprint(learning_bp, url_prefix='/api/learning')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({'message': 'Nagarbhavi Brigades Backend is running!'}), 200
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
