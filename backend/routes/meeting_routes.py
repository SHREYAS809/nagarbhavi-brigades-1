from flask import Blueprint, request, jsonify
from backend.models import Meeting, User
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required
import datetime

meeting_bp = Blueprint('meetings', __name__)

@meeting_bp.route('/', methods=['GET'])
@token_required
def get_meetings(current_user):
    time_filter = request.args.get('filter')
    query = Meeting.query

    if time_filter in ['6m', '12m']:
        months = 6 if time_filter == '6m' else 12
        # Date is stored as string YYYY-MM-DD in Meeting model
        cutoff_date = (datetime.datetime.utcnow() - datetime.timedelta(days=months * 30)).strftime('%Y-%m-%d')
        query = query.filter(Meeting.date >= cutoff_date)

    meetings = query.order_by(Meeting.date.desc()).all()
    result = []
    for m in meetings:
        participants = [{
            'id': str(u.id),
            'name': u.name,
            'email': u.email
        } for u in m.attendees]
        
        # Construct date_time if mostly likely needed, or just let frontend handle it.
        # Frontend uses meeting.date_time.
        date_str = m.date if m.date else ""
        time_str = m.time if m.time else ""
        dt = f"{date_str}T{time_str}" if date_str and time_str else None
        
        result.append({
            'id': str(m.id),
            '_id': str(m.id),
            'title': m.title,
            'date': m.date,
            'time': m.time,
            'date_time': dt, # Added for frontend compatibility
            'location': m.location,
            'description': m.description,
            'type': m.type,
            'meeting_mode': m.meeting_mode,
            'meet_link': m.meet_link,
            'fee': m.fee,
            'attendee_count': m.attendees.count(),
            'participants': participants # Added list of participants
        })
    return jsonify(result), 200

@meeting_bp.route('/', methods=['POST'])
@token_required
def create_meeting(current_user):
    try:
        data = request.get_json()
        
        # Safely cast organizer_id to int
        organizer_id = data.get('organizer_id', current_user.id)
        try:
            if organizer_id is not None:
                organizer_id = int(organizer_id)
        except (ValueError, TypeError):
            organizer_id = current_user.id

        # VERY IMPORTANT FIX: If the frontend sends an old/cached organizer_id that was deleted 
        # from the live PostgreSQL database, it will crash with a Foreign Key IntegrityError.
        # Check if this user actually exists.
        if organizer_id != current_user.id:
            organizer_exists = User.query.get(organizer_id)
            if not organizer_exists:
                organizer_id = current_user.id # Fallback to the person making the request

        try:
            fee = float(data.get('fee', 0.0))
        except (ValueError, TypeError):
            fee = 0.0

        new_meeting = Meeting(
            title=data.get('title'),
            date=data.get('date'),
            time=data.get('time'),
            location=data.get('location'),
            description=data.get('description'),
            type=data.get('type', 'Chapter Meeting'),
            meeting_mode=data.get('meeting_mode', 'Offline'),
            meet_link=data.get('meet_link'),
            fee=fee,
            organized_by=organizer_id
        )
        db.session.add(new_meeting)
        db.session.commit()
        return jsonify({'message': 'Meeting scheduled', 'id': str(new_meeting.id)}), 201
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error creating meeting: {error_trace}")
        return jsonify({'message': 'Exception during meeting creation', 'error': str(e), 'trace': error_trace}), 500

@meeting_bp.route('/<id>', methods=['PUT'])
@token_required
def update_meeting(current_user, id):
    data = request.get_json()
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404
        
    for key, value in data.items():
        if hasattr(meeting, key):
            setattr(meeting, key, value)
            
    db.session.commit()
    return jsonify({'message': 'Meeting updated'}), 200

@meeting_bp.route('/<id>/register', methods=['POST'])
@token_required
def register_meeting(current_user, id):
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404
        
    # Check if already registered
    # current_user is a User object from token_required
    if meeting.attendees.filter_by(id=current_user.id).first():
         return jsonify({'message': 'Already registered'}), 400
         
    meeting.attendees.append(current_user)
    db.session.commit()
    return jsonify({'message': 'Registered successfully'}), 200

@meeting_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_meeting(current_user, id):
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404
        
    db.session.delete(meeting)
    db.session.commit()
    return jsonify({'message': 'Meeting deleted'}), 200
