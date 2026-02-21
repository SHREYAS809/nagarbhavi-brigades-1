from flask import Blueprint, request, jsonify
from backend.models import Revenue, User
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required
from backend.utils.email_service import send_email
from sqlalchemy import or_
import datetime

revenue_bp = Blueprint('revenue', __name__)

@revenue_bp.route('/', methods=['GET'])
@token_required
def get_revenue(current_user):
    time_filter = request.args.get('filter')
    member_id = request.args.get('member_id')
    category = request.args.get('category')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    
    query = Revenue.query

    if time_filter in ['6m', '12m']:
        months = 6 if time_filter == '6m' else 12
        cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=months * 30)
        query = query.filter(Revenue.created_at >= cutoff_date)

    if member_id:
        query = query.filter(or_(Revenue.member_id == member_id, Revenue.created_by == member_id))
    
    if category:
        # Join User to filter by category of either referrer or recipient
        referrer_alias = db.aliased(User)
        recipient_alias = db.aliased(User)
        query = query.join(referrer_alias, Revenue.member_id == referrer_alias.id, isouter=True)
        query = query.join(recipient_alias, Revenue.created_by == recipient_alias.id, isouter=True)
        query = query.filter(or_(referrer_alias.business_category == category, recipient_alias.business_category == category))

    if start_date:
        query = query.filter(Revenue.date >= start_date)
    if end_date:
        query = query.filter(Revenue.date <= end_date)

    if current_user.role == 'admin':
        revenue = query.order_by(Revenue.created_at.desc()).all()
    else:
        # Use SQLAlchemy OR
        revenue = query.filter(
            or_(
                Revenue.member_id == current_user.id,
                Revenue.created_by == current_user.id
            )
        ).order_by(Revenue.created_at.desc()).all()

    result = []
    for r in revenue:
        result.append({
            'id': str(r.id),
            '_id': str(r.id),
            'amount': r.amount,
            'type': r.type,
            'member_id': str(r.member_id),
            'created_by': str(r.created_by),
            'referral_id': str(r.referral_id) if r.referral_id else None,
            'notes': r.notes,
            'date': r.date,
            'created_at': r.created_at.isoformat() if r.created_at else None
        })
    return jsonify(result), 200

@revenue_bp.route('/', methods=['POST'])
@token_required
def add_revenue(current_user):
    data = request.get_json()
    
    # Validation
    try:
        amount = float(data.get('amount'))
        member_id = int(data.get('member_id')) # Member who GAVE the business (Referrer)
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid amount or member_id'}), 400

    new_revenue = Revenue(
        amount=amount,
        type=data.get('type', 'Thank You For Closed Business'),
        member_id=member_id,
        created_by=current_user.id, # Current user RECEIVED the business
        referral_id=data.get('referral_id'), # Optional
        notes=data.get('notes'),
        appreciation_message=data.get('appreciation_message'),
        appreciation_reason=data.get('appreciation_reason'),
        date=data.get('date', datetime.datetime.utcnow().strftime('%Y-%m-%d'))
    )
    
    db.session.add(new_revenue)
    db.session.commit()
    
    # Send Thank You Email to the member who gave the referral/business
    try:
        recipient = User.query.get(member_id)
        if recipient and recipient.email:
            send_email(
                subject=f"New Thank You Slip from {current_user.name}",
                recipients=[recipient.email],
                html_body=f"""
                <h1>You received a Thank You Slip!</h1>
                <p><strong>From:</strong> {current_user.name}</p>
                <p><strong>Amount:</strong> ₹{amount}</p>
                <p><strong>Notes:</strong> {data.get('notes', 'No notes')}</p>
                <p>Great job generating business for the chapter!</p>
                """
            )
    except Exception as e:
        print(f"Failed to send Thank You email: {e}")

    return jsonify({'message': 'Revenue added', 'id': str(new_revenue.id)}), 201

# Admin routes for updating/deleting revenue? 
# Usually revenue is immutable or requires strict audit. 
# Implementing basic CRUD for now as per previous design.

@revenue_bp.route('/<id>', methods=['PUT'])
@token_required
@admin_required
def update_revenue(current_user, id):
    data = request.get_json()
    revenue = Revenue.query.get(id)
    if not revenue:
        return jsonify({'message': 'Record not found'}), 404
        
    if 'amount' in data:
        revenue.amount = data['amount']
    if 'notes' in data:
        revenue.notes = data['notes']
        
    db.session.commit()
    return jsonify({'message': 'Revenue updated'}), 200

@revenue_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_revenue(current_user, id):
    revenue = Revenue.query.get(id)
    if not revenue:
        return jsonify({'message': 'Record not found'}), 404
        
    db.session.delete(revenue)
    db.session.commit()
    return jsonify({'message': 'Revenue deleted'}), 200
@revenue_bp.route('/total', methods=['GET'])
@token_required
@admin_required
def get_total_revenue(current_user):
    revenue = Revenue.query.all()
    total = sum(r.amount for r in revenue)
    return jsonify({'total': total}), 200

@revenue_bp.route('/monthly', methods=['GET'])
@token_required
@admin_required
def get_monthly_revenue(current_user):
    revenue = Revenue.query.all()
    monthly = {}
    for r in revenue:
        # Assuming date is string YYYY-MM-DD
        try:
            date_obj = datetime.datetime.strptime(r.date, '%Y-%m-%d')
            month = date_obj.strftime('%B')
        except:
            month = 'Unknown'
            
        monthly[month] = monthly.get(month, 0) + r.amount
    return jsonify(monthly), 200
