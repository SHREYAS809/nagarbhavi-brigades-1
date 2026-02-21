from flask import Blueprint, request, jsonify
from backend.models import User
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@token_required
def get_users(current_user):
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    
    query = User.query
    if search:
        query = query.filter(User.name.ilike(f'%{search}%'))
    if category:
        query = query.filter(User.business_category == category)
        
    users = query.all()
    result = []
    for u in users:
        result.append({
            'id': str(u.id),
            '_id': str(u.id),
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'phone': u.phone,
            'chapter': u.chapter,
            'business_category': u.business_category,
            'membership_plan': u.membership_plan,
            'photo': u.photo
        })
    return jsonify(result), 200

@user_bp.route('/<id>', methods=['PUT'])
@token_required
def update_user(current_user, id):
    # Allow if admin OR if current user is updating themselves
    if current_user.role != 'admin' and str(current_user.id) != id:
        return jsonify({'message': 'Permission denied'}), 403
        
    data = request.get_json()
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Allow partial updates
    allowed_fields = ['name', 'phone', 'business_category', 'chapter', 'photo', 'bio', 'membership_plan']
    if current_user.role == 'admin':
        allowed_fields.extend(['role', 'membership_tier', 'membership_status'])
        
    for key, value in data.items():
        if key in allowed_fields:
            setattr(user, key, value)
            
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200

@user_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, id):
    user = User.query.get(id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200
