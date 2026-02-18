from flask import Blueprint, request, jsonify
from backend.models.notification import Notification
from backend.utils.auth import token_required, admin_required

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/', methods=['GET'])
@token_required
def get_notifications(current_user):
    notifications = Notification.get_by_user(current_user['_id'])
    for n in notifications:
        n['_id'] = str(n['_id'])
        n['user_id'] = str(n['user_id'])
    return jsonify(notifications), 200

@notification_bp.route('/broadcast', methods=['POST'])
@token_required
@admin_required # Assuming admin_required is imported
def send_broadcast(current_user):
    data = request.get_json()
    subject = data.get('subject')
    content = data.get('content')
    group = data.get('recipientGroup', 'all')
    
    from backend.models.user import User
    from backend.utils.email_service import send_email
    
    users = User.get_all_users()
    recipients = []
    
    for user in users:
        # Filter logic
        if group == 'all':
            recipients.append(user)
        elif group == 'premium' and user.get('membership_tier') in ['Premium', 'Gold', 'Platinum']:
            recipients.append(user)
        elif group == 'active' and user.get('status') == 'active':
            recipients.append(user)
        elif group == 'inactive' and user.get('status') != 'active':
            recipients.append(user)
            
    # Create notifications and collect emails
    email_list = []
    for user in recipients:
        Notification.create_notification({
            'user_id': str(user['_id']),
            'type': 'broadcast',
            'message': f"{subject}: {content[:50]}...", # Brief preview
            'read_status': False
        })
        if user.get('email'):
            email_list.append(user['email'])
            
    # Send email (bulk or individual? Flask-Mail supports list)
    if email_list:
        send_email(subject, email_list, content)
        
    return jsonify({'message': f'Broadcast sent to {len(recipients)} members'}), 200

@notification_bp.route('/<id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, id):
    Notification.mark_as_read(id)
    return jsonify({'message': 'Marked as read'}), 200
