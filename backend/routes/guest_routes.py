from flask import Blueprint, request, jsonify
from backend.models import Guest, User
from backend.utils.extensions import db
from backend.utils.auth import token_required
from datetime import datetime

guest_bp = Blueprint('guest_bp', __name__)

@guest_bp.route('/', methods=['POST'])
@token_required
def invite_guest(current_user):
    data = request.json
    
    if not data.get('name') or not data.get('phone'):
        return jsonify({'message': 'Name and phone are required'}), 400

    new_guest = Guest(
        name=data['name'],
        email=data.get('email', ''),
        phone=data['phone'],
        invited_by=current_user.id,
        visit_date=data.get('visit_date', ''),
        status='Invited',
        notes=data.get('notes', '')
    )

    db.session.add(new_guest)
    db.session.commit()

    return jsonify({'message': 'Guest invited successfully!', 'guest_id': new_guest.id}), 201

@guest_bp.route('/', methods=['GET'])
@token_required
def get_guests(current_user):
    guests = Guest.query.filter_by(invited_by=current_user.id).all()
    
    output = []
    for guest in guests:
        output.append({
            'id': guest.id,
            'name': guest.name,
            'phone': guest.phone,
            'email': guest.email,
            'visit_date': guest.visit_date,
            'status': guest.status,
            'notes': guest.notes,
            'created_at': guest.created_at.strftime('%Y-%m-%d')
        })

    return jsonify(output), 200

@guest_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_guest(current_user, id):
    guest = Guest.query.filter_by(id=id, invited_by=current_user.id).first()
    
    if not guest:
        return jsonify({'message': 'Guest not found'}), 404

    data = request.json
    
    if 'status' in data:
        guest.status = data['status']
    if 'visit_date' in data:
        guest.visit_date = data['visit_date']
    if 'notes' in data:
        guest.notes = data['notes']
        
    db.session.commit()

    return jsonify({'message': 'Guest updated successfully'}), 200
