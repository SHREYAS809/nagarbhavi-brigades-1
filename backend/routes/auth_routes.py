from flask import Blueprint, request, jsonify, current_app
from backend.models.user import User
from backend.utils.extensions import bcrypt
import jwt
import datetime
from backend.utils.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.find_by_email(data['email']):
        return jsonify({'message': 'User already exists!'}), 409

    data['password'] = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    User.create_user(data)
    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.find_by_email(data['email'])

    if user and bcrypt.check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'role': user.get('role', 'member'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            'token': token,
            'role': user.get('role', 'member'),
            'name': user.get('name'),
            'id': str(user['_id'])
        }), 200

    return jsonify({'message': 'Invalid credentials!'}), 401

@auth_bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    users = User.get_all_users()
    result = []
    for u in users:
        result.append({
            'id': str(u['_id']),
            'name': u['name'],
            'email': u['email'],
             # minimal info
        })
    return jsonify(result), 200
