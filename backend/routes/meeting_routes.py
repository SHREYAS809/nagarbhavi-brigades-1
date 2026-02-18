from flask import Blueprint, request, jsonify
from backend.models.meeting import Meeting
from backend.utils.auth import token_required, admin_required

meeting_bp = Blueprint('meetings', __name__)

@meeting_bp.route('/', methods=['GET'])
@token_required
def get_meetings(current_user):
    meetings = Meeting.get_all_meetings()
    for m in meetings:
        m['_id'] = str(m['_id'])
    return jsonify(meetings), 200

@meeting_bp.route('/', methods=['POST'])
@token_required
@admin_required
def create_meeting(current_user):
    data = request.get_json()
    Meeting.create_meeting(data)
    return jsonify({'message': 'Meeting scheduled'}), 201

@meeting_bp.route('/<id>', methods=['PUT'])
@token_required
@admin_required
def update_meeting(current_user, id):
    data = request.get_json()
    Meeting.update_meeting(id, data)
    return jsonify({'message': 'Meeting updated'}), 200

@meeting_bp.route('/<id>/register', methods=['POST'])
@token_required
def register_meeting(current_user, id):
    Meeting.add_participant(id, current_user['_id'])
    return jsonify({'message': 'Registered successfully'}), 200

@meeting_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_meeting(current_user, id):
    Meeting.delete_meeting(id)
    return jsonify({'message': 'Meeting deleted'}), 200
