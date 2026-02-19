from flask import Blueprint, request, jsonify
from backend.models import Referral, User
from backend.utils.extensions import db
from backend.utils.auth import token_required
from backend.utils.email_service import send_email

referral_bp = Blueprint('referrals', __name__)

@referral_bp.route('/', methods=['GET'])
@token_required
def get_referrals(current_user):
    # Admin sees all, members see sent/received
    if current_user.role == 'admin':
        referrals = Referral.query.order_by(Referral.created_at.desc()).all()
    else:
        # Fetch logic: Either from_member or to_member is current user
        # SQLAlchemy OR condition is complex, simpler to query all for now or 2 queries
        # referrals = Referral.query.filter((Referral.from_member_id == current_user.id) | (Referral.to_member_id == current_user.id)).all()
        # Let's return all for "visibility" for now, or fetch all and filter in python if lazy
        referrals = Referral.query.order_by(Referral.created_at.desc()).all()

    result = []
    for r in referrals:
        result.append({
            'id': str(r.id),
            '_id': str(r.id),
            'from_member': str(r.from_member_id),
            'to_member': str(r.to_member_id),
            'contact_name': r.contact_name,
            'email': r.email,
            'phone': r.phone,
            'referral_type': r.referral_type,
            'heat': r.heat,
            'comments': r.comments,
            'status': r.status,
            'created_at': r.created_at.isoformat() if r.created_at else None
        })
    
    return jsonify(result), 200

@referral_bp.route('/', methods=['POST'])
@token_required
def add_referral(current_user):
    data = request.get_json()
    
    to_member_id = data.get('to_member') or data.get('to_member_id')
    # If to_member is string ID, ensure it's int for SQL
    try:
        to_member_id = int(to_member_id)
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid to_member ID'}), 400

    to_member = User.query.get(to_member_id)
    if not to_member:
        return jsonify({'message': 'Recipient member not found'}), 404

    new_referral = Referral(
        from_member_id=current_user.id,
        to_member_id=to_member_id,
        contact_name=data.get('contact_name'),
        email=data.get('email'),
        phone=data.get('phone'),
        referral_type=data.get('type'),
        heat=data.get('heat'),
        comments=data.get('comments'),
        status='New'
    )
    
    db.session.add(new_referral)
    db.session.commit()
    
    # Send Email
    if to_member.email:
        send_email(
            "New Referral Received!",
            [to_member.email],
            f"<h1>You have a new referral!</h1><p>From: {current_user.name}</p><p>Contact: {new_referral.contact_name}</p>"
        )

    return jsonify({'message': 'Referral added successfully!', 'id': str(new_referral.id)}), 201

@referral_bp.route('/<id>', methods=['PUT'])
@token_required
def update_referral(current_user, id):
    data = request.get_json()
    referral = Referral.query.get(id)
    if not referral:
        return jsonify({'message': 'Referral not found'}), 404
        
    if 'status' in data:
        referral.status = data['status']
    if 'comments' in data:
        referral.comments = data['comments']
        
    db.session.commit()
    return jsonify({'message': 'Referral updated'}), 200

@referral_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_referral(current_user, id):
    referral = Referral.query.get(id)
    if not referral:
        return jsonify({'message': 'Referral not found'}), 404
        
    db.session.delete(referral)
    db.session.commit()
    return jsonify({'message': 'Referral deleted'}), 200

@referral_bp.route('/<id>/close', methods=['PATCH'])
@token_required
def close_referral(current_user, id):
    referral = Referral.query.get(id)
    if referral:
        referral.status = 'Closed'
        db.session.commit()
        return jsonify({'message': 'Referral closed'}), 200
    return jsonify({'message': 'Referral not found'}), 404
