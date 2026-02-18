from flask import Blueprint, request, jsonify
from backend.models.event import Event
from backend.utils.auth import token_required, admin_required
from backend.utils.email_service import send_email

event_bp = Blueprint('events', __name__)

@event_bp.route('/', methods=['GET'])
@token_required
def get_events(current_user):
    events = Event.get_all_events()
    for e in events:
        e['_id'] = str(e['_id'])
        e['registered_members'] = [str(m) for m in e.get('registered_members', [])]
    return jsonify(events), 200

@event_bp.route('/', methods=['POST'])
@token_required
@admin_required
def create_event(current_user):
    data = request.get_json()
    Event.create_event(data)
    return jsonify({'message': 'Event created'}), 201

@event_bp.route('/<id>/register', methods=['POST'])
@token_required
def register_event(current_user, id):
    Event.register_user(id, current_user['_id'])
    # Send confirmation email
    if current_user.get('email'):
        send_email(
            "Event Registration Confirmed",
            [current_user['email']],
            f"<h1>You have registered for an event!</h1>"
        )
    return jsonify({'message': 'Registered successfully'}), 200

@event_bp.route('/<id>/cancel', methods=['POST'])
@token_required
def cancel_event(current_user, id):
    Event.cancel_registration(id, current_user['_id'])
    return jsonify({'message': 'Registration cancelled'}), 200

@event_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_event(current_user, id):
    Event.delete_event(id)
    return jsonify({'message': 'Event deleted'}), 200
