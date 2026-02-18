from flask import Blueprint, request, jsonify
from backend.models.user import User
from backend.utils.auth import token_required, admin_required
from bson import ObjectId

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@token_required
def get_users(current_user):
    users = User.get_all_users()
    result = []
    for u in users:
        u['_id'] = str(u['_id'])
        # Remove password
        u.pop('password', None)
        result.append(u)
    return jsonify(result), 200

@user_bp.route('/<id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, id):
    data = request.get_json()
    # Prevent updating _id
    if '_id' in data:
        del data['_id']
    
    # Check if user exists
    user = User.find_by_id(id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    User.update_user(id, data)
    return jsonify({'message': 'User updated successfully'}), 200

@user_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, id):
    # Check if user exists
    user = User.find_by_id(id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    User.delete_user(id)
    return jsonify({'message': 'User deleted successfully'}), 200
