from flask import Blueprint, request, jsonify, current_app
from backend.models import User
from backend.utils.extensions import db, bcrypt
import jwt
import datetime
from backend.utils.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data['email'].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists!'}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    new_user = User(
        name=data['name'],
        email=email,
        password=hashed_password,
        role=data.get('role', 'member'),
        business_category=data.get('business_category'),
        phone=data.get('phone'),
        chapter=data.get('chapter', 'Nagarbhavi Brigades'),
        membership_plan=data.get('membership_plan', '12 Months')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email'].strip().lower()
    user = User.query.filter_by(email=email).first()

    if user:
        if bcrypt.check_password_hash(user.password, data['password']):
            token = jwt.encode({
                'user_id': str(user.id),
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, current_app.config['SECRET_KEY'], algorithm="HS256")

            return jsonify({
                'token': token,
                'role': user.role,
                'name': user.name,
                'id': str(user.id),
                '_id': str(user.id) # Frontend compatibility
            }), 200
        else:
            print(f"Login failed: Password mismatch for user {data['email']}")
    else:
        print(f"Login failed: User {data['email']} not found")

    return jsonify({'message': 'Invalid credentials!'}), 401

@auth_bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    users = User.query.all()
    result = []
    for u in users:
        result.append({
            'id': str(u.id),
            '_id': str(u.id), # Frontend compatibility
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'business_category': u.business_category
        })
    return jsonify(result), 200

@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return jsonify({'message': 'Missing fields'}), 400

    # User object is passed from token_required decorator (we need to update that too)
    # Assuming token_required returns the User object
    
    if not bcrypt.check_password_hash(current_user.password, current_password):
        return jsonify({'message': 'Incorrect current password'}), 401

    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    current_user.password = hashed_password
    db.session.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200
