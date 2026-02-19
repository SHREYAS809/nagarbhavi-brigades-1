from flask import Blueprint, request, jsonify
from backend.models import Notification, User
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required
from backend.utils.email_service import send_email

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/', methods=['GET'])
@token_required
def get_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
    result = []
    for n in notifications:
        result.append({
            'id': str(n.id),
            '_id': str(n.id),
            'user_id': str(n.user_id),
            'type': n.type,
            'message': n.message,
            'subject': n.subject,
            'content': n.content,
            'read_status': n.read_status,
            'created_at': n.created_at.isoformat() if n.created_at else None
        })
    return jsonify(result), 200

@notification_bp.route('/broadcast', methods=['POST'])
@token_required
@admin_required
def send_broadcast(current_user):
    data = request.get_json()
    subject = data.get('subject')
    content = data.get('content')
    group = data.get('recipientGroup', 'all')
    
    # Filter users logic (simple implementation)
    query = User.query
    if group == 'premium':
        # Assuming membership_tier exists or we simulate
        # query = query.filter(User.membership_tier.in_(['Premium', 'Gold']))
        pass 
    elif group == 'active':
        # query = query.filter_by(status='active')
        pass
        
    recipients = query.all()
    
    email_list = []
    for user in recipients:
        new_notif = Notification(
            user_id=user.id,
            type='broadcast',
            subject=subject,
            content=content,
            message=f"{subject}: {content[:50]}...",
            read_status=False
        )
        db.session.add(new_notif)
        
        if user.email:
            email_list.append(user.email)
            
    db.session.commit()

    if email_list:
        send_email(subject, email_list, content)
        
    return jsonify({'message': f'Broadcast sent to {len(recipients)} members'}), 200

@notification_bp.route('/<id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, id):
    notification = Notification.query.get(id)
    if notification and notification.user_id == current_user.id:
        notification.read_status = True
        db.session.commit()
        return jsonify({'message': 'Marked as read'}), 200
    return jsonify({'message': 'Notification not found or access denied'}), 404
