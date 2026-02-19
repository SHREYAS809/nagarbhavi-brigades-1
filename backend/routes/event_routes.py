from flask import Blueprint, request, jsonify
from backend.models import Event, User
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required
from backend.utils.email_service import send_email

event_bp = Blueprint('events', __name__)

@event_bp.route('/', methods=['GET'])
@token_required
def get_events(current_user):
    events = Event.query.all()
    result = []
    for e in events:
        result.append({
            'id': str(e.id),
            '_id': str(e.id),
            'title': e.title,
            'date': e.date,
            'description': e.description,
            'registered_members': [str(u.id) for u in e.attendees]
        })
    return jsonify(result), 200

@event_bp.route('/', methods=['POST'])
@token_required
@admin_required
def create_event(current_user):
    data = request.get_json()
    new_event = Event(
        title=data.get('title'),
        date=data.get('date'),
        description=data.get('description')
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({'message': 'Event created'}), 201

@event_bp.route('/<id>/register', methods=['POST'])
@token_required
def register_event(current_user, id):
    event = Event.query.get(id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404
        
    if event.attendees.filter_by(id=current_user.id).first():
        return jsonify({'message': 'Already registered'}), 400
        
    event.attendees.append(current_user)
    db.session.commit()
    
    if current_user.email:
        send_email(
            "Event Registration Confirmed",
            [current_user.email],
            f"<h1>You have registered for {event.title}!</h1>"
        )
    return jsonify({'message': 'Registered successfully'}), 200

@event_bp.route('/<id>/cancel', methods=['POST'])
@token_required
def cancel_event(current_user, id):
    event = Event.query.get(id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404
        
    if event.attendees.filter_by(id=current_user.id).first():
        event.attendees.remove(current_user)
        db.session.commit()
        return jsonify({'message': 'Registration cancelled'}), 200
    return jsonify({'message': 'Not registered'}), 400

@event_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_event(current_user, id):
    event = Event.query.get(id)
    if not event:
        return jsonify({'message': 'Event not found'}), 404
        
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Event deleted'}), 200
