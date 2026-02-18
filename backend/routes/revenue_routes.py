from flask import Blueprint, request, jsonify
from backend.models.revenue import Revenue
from backend.utils.auth import token_required, admin_required

revenue_bp = Blueprint('revenue', __name__)

@revenue_bp.route('/', methods=['GET'])
@token_required
def get_revenue(current_user):
    # If admin, return all. If member, return only theirs.
    if current_user.get('role') == 'admin':
        revenue = Revenue.get_all_revenue()
    else:
        # We need a get_by_member method in Revenue model
        # Quick fix: fetch all and filter here (inefficient but works for MVP) or add method.
        # Let's add method to model in next step or use direct mongo query here if lazy.
        # Better: add get_by_member to model. 
        # For now, let's assume get_all_revenue() exists and filter python side if list is small, 
        # or use mongo.db.revenue.find({'member_id': ...})
        # Fetch revenue where user is beneficiary (Earned) OR user is creator (Given)
        from backend.utils.extensions import mongo
        from bson.objectid import ObjectId
        revenue = list(mongo.db.revenue.find({
            '$or': [
                {'member_id': current_user['_id']},
                {'created_by': current_user['_id']}
            ]
        }))

    for r in revenue:
        r['_id'] = str(r['_id'])
        r['member_id'] = str(r['member_id'])
        if 'created_by' in r:
            r['created_by'] = str(r['created_by'])
    return jsonify(revenue), 200

@revenue_bp.route('/', methods=['POST'])
@token_required
def add_revenue(current_user):
    data = request.get_json()
    data['created_by'] = current_user['_id']
    Revenue.create_revenue(data)
    return jsonify({'message': 'Revenue added'}), 201

@revenue_bp.route('/<id>', methods=['PUT'])
@token_required
@admin_required
def update_revenue(current_user, id):
    data = request.get_json()
    Revenue.update_revenue(id, data)
    return jsonify({'message': 'Revenue updated'}), 200

@revenue_bp.route('/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_revenue(current_user, id):
    Revenue.delete_revenue(id)
    return jsonify({'message': 'Revenue deleted'}), 200

@revenue_bp.route('/total', methods=['GET'])
@token_required
@admin_required
def get_total_revenue(current_user):
    revenue = Revenue.get_all_revenue()
    total = sum(r.get('amount', 0) for r in revenue)
    return jsonify({'total': total}), 200

@revenue_bp.route('/monthly', methods=['GET'])
@token_required
@admin_required
def get_monthly_revenue(current_user):
    revenue = Revenue.get_all_revenue()
    monthly = {}
    for r in revenue:
        month = r.get('month', 'Unknown')
        monthly[month] = monthly.get(month, 0) + r.get('amount', 0)
    return jsonify(monthly), 200
