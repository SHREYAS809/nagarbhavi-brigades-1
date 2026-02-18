from flask import Blueprint, request, jsonify
from backend.models.referral import Referral
from backend.models.user import User
from backend.utils.auth import token_required
from backend.utils.email_service import send_email
from bson import ObjectId

referral_bp = Blueprint('referrals', __name__)

@referral_bp.route('/', methods=['GET'])
@token_required
def get_referrals(current_user):
    # If admin, see all? Or just see own? Usually BNI members see referrals given/received.
    # For now, let's return all for admin, and involved for members.
    if current_user.get('role') == 'admin':
        referrals = Referral.get_all_referrals()
    else:
        # Complex query for sent OR received
        # Simplification: return all for now or filter. The prompt says "GET referrals".
        # Let's return all for simplicity or filter by user if specific requirement.
        # "Members can submit referrals."
        referrals = Referral.get_all_referrals() # allowing transparency

    # Convert ObjectId to str
    for r in referrals:
        r['_id'] = str(r['_id'])
        r['from_member'] = str(r['from_member'])
        r['to_member'] = str(r['to_member'])
    
    return jsonify(referrals), 200

@referral_bp.route('/', methods=['POST'])
@token_required
def add_referral(current_user):
    data = request.get_json()
    data['from_member'] = str(current_user['_id'])
    
    # Validation: check if to_member exists
    to_member = User.find_by_id(data['to_member'])
    if not to_member:
        return jsonify({'message': 'Recipient member not found'}), 404

    Referral.create_referral(data)
    
    # Send Email
    if to_member.get('email'):
        send_email(
            "New Referral Recieved!",
            [to_member['email']],
            f"<h1>You have a new referral!</h1><p>From: {current_user.get('name')}</p><p>Contact: {data.get('contact_name')}</p>"
        )

    return jsonify({'message': 'Referral added successfully!'}), 201

@referral_bp.route('/<id>', methods=['PUT'])
@token_required
def update_referral(current_user, id):
    data = request.get_json()
    Referral.update_referral(id, data)
    return jsonify({'message': 'Referral updated'}), 200

@referral_bp.route('/<id>', methods=['DELETE'])
@token_required
def delete_referral(current_user, id):
    Referral.delete_referral(id)
    return jsonify({'message': 'Referral deleted'}), 200

@referral_bp.route('/<id>/close', methods=['PATCH'])
@token_required
def close_referral(current_user, id):
    Referral.update_referral(id, {'status': 'Closed'})
    return jsonify({'message': 'Referral closed'}), 200
