from flask import Flask, jsonify
from flask_cors import CORS
from backend.config.config import Config
from backend.utils.extensions import mongo, bcrypt, mail
from backend.routes.auth_routes import auth_bp
from backend.routes.referral_routes import referral_bp
from backend.routes.revenue_routes import revenue_bp
from backend.routes.meeting_routes import meeting_bp
from backend.routes.event_routes import event_bp
from backend.routes.notification_routes import notification_bp
from backend.routes.user_routes import user_bp
from backend.routes.guest_routes import guest_bp
from backend.routes.learning_routes import learning_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Extensions
    # Initialize Extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    
    from backend.utils.extensions import db, migrate
    db.init_app(app)
    migrate.init_app(app, db)
    
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

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({'message': 'Nagarbhavi Brigades Backend is running!'}), 200
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
