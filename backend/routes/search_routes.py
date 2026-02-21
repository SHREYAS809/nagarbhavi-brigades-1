from flask import Blueprint, request, jsonify
from backend.models import User
from backend.utils.auth import token_required
from sqlalchemy import or_

search_bp = Blueprint('search', __name__)

@search_bp.route('/', methods=['GET'])
@token_required
def search(current_user):
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
        
    search_term = f"%{query}%"
    
    # Search members and businesses
    results = User.query.filter(
        or_(
            User.name.ilike(search_term),
            User.email.ilike(search_term),
            User.phone.ilike(search_term),
            User.business_name.ilike(search_term),
            User.business_category.ilike(search_term),
            User.services_offered.ilike(search_term)
        )
    ).all()
    
    formatted_results = []
    for r in results:
        formatted_results.append({
            'id': str(r.id),
            'name': r.name,
            'email': r.email,
            'phone': r.phone,
            'business_name': r.business_name,
            'business_category': r.business_category,
            'services_offered': r.services_offered,
            'role': r.role,
            'chapter': r.chapter
        })
        
    return jsonify(formatted_results), 200
