from flask import Blueprint, request, jsonify
from backend.models import LearningCredit, User
from backend.utils.extensions import db
from backend.utils.auth import token_required
from datetime import datetime

learning_bp = Blueprint('learning_bp', __name__)

@learning_bp.route('/', methods=['POST'])
@token_required
def submit_ceu(current_user):
    data = request.json
    
    if not data.get('topic') or not data.get('duration_hours'):
        return jsonify({'message': 'Topic and duration are required'}), 400

    new_credit = LearningCredit(
        member_id=current_user.id,
        topic=data['topic'],
        source=data.get('source', 'Other'),
        duration_hours=float(data.get('duration_hours', 1.0)),
        date=data.get('date', datetime.today().strftime('%Y-%m-%d')),
        notes=data.get('notes', '')
    )

    db.session.add(new_credit)
    db.session.commit()

    return jsonify({'message': 'Learning credit submitted successfully!', 'credit_id': new_credit.id}), 201

@learning_bp.route('/', methods=['GET'])
@token_required
def get_ceus(current_user):
    credits = LearningCredit.query.filter_by(member_id=current_user.id).order_by(LearningCredit.created_at.desc()).all()
    
    output = []
    for credit in credits:
        output.append({
            'id': credit.id,
            'topic': credit.topic,
            'source': credit.source,
            'duration_hours': credit.duration_hours,
            'date': credit.date,
            'notes': credit.notes,
            'created_at': credit.created_at.strftime('%Y-%m-%d')
        })

    return jsonify(output), 200
