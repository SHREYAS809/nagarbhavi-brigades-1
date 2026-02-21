from flask import Blueprint, request, jsonify
from backend.models import Referral, Revenue, Meeting, Event, User, OneToOne, meeting_attendees, event_attendees
from backend.utils.extensions import db
from backend.utils.auth import token_required, admin_required
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta
import calendar

analytics_bp = Blueprint('analytics', __name__)

def get_date_range(filter_type):
    now = datetime.utcnow()
    if filter_type == '6m':
        start_date = now - timedelta(days=6*30)
    elif filter_type == '12m':
        start_date = now - timedelta(days=365)
    else: # lifetime
        start_date = datetime(2000, 1, 1)
    return start_date

@analytics_bp.route('/', methods=['GET'])
@token_required
@admin_required
def get_analytics(current_user):
    filter_type = request.args.get('filter', '6m')
    start_date = get_date_range(filter_type)
    
    # Referrals
    referrals_given = Referral.query.filter(Referral.created_at >= start_date).count()
    referrals_received = Referral.query.filter(Referral.created_at >= start_date).count() # Same as given globally
    
    # Revenue
    total_revenue = db.session.query(func.sum(Revenue.amount)).filter(Revenue.created_at >= start_date).scalar() or 0
    
    # Meetings & Events
    # count total attendance records
    meetings_count = Meeting.query.filter(Meeting.created_at >= start_date).count()
    events_count = Event.query.filter(Event.created_at >= start_date).count()
    
    # Member Growth
    # Group by month
    growth_data = db.session.query(
        extract('year', User.created_at).label('year'),
        extract('month', User.created_at).label('month'),
        func.count(User.id)
    ).filter(User.created_at >= start_date).group_by('year', 'month').order_by('year', 'month').all()
    
    formatted_growth = []
    for g in growth_data:
        formatted_growth.append({
            'label': f"{calendar.month_name[int(g[1])][:3]} {int(g[0])}",
            'value': g[2]
        })

    # Performance Trends (Referrals & Revenue over time)
    trends = db.session.query(
        extract('year', Referral.created_at).label('year'),
        extract('month', Referral.created_at).label('month'),
        func.count(Referral.id)
    ).filter(Referral.created_at >= start_date).group_by('year', 'month').order_by('year', 'month').all()
    
    formatted_trends = []
    for t in trends:
        formatted_trends.append({
            'month': f"{calendar.month_name[int(t[1])][:3]} {int(t[0])}",
            'referrals': t[2]
        })
        
    return jsonify({
        'summary': {
            'referrals_given': referrals_given,
            'referrals_received': referrals_received,
            'revenue_generated': total_revenue,
            'meetings_attended': meetings_count, # Simplified
            'events_participation': events_count,
            'member_growth': len(formatted_growth)
        },
        'growth_chart': formatted_growth,
        'performance_chart': formatted_trends
    }), 200

@analytics_bp.route('/engagement', methods=['GET'])
@token_required
@admin_required
def get_engagement_stats(current_user):
    # This would calculate engagement for ALL members
    users = User.query.filter_by(role='member').all()
    result = []
    
    for u in users:
        # Simple engagement calculation logic
        # High: > 10 points, Growing: 5-10, Inactive: < 5
        # Points: Meeting=2, Referral=2, Event=1, OneToOne=3
        
        points = 0
        points += u.meetings.count() * 2
        # Use simple length if dynamic is not set or use query
        # But User.meetings is relationship
        # referrals_given = len(u.referrals_given)
        # points += referrals_given * 2
        # events = len(u.events)
        # points += events * 1
        
        # Let's use more accurate counts
        ref_count = Referral.query.filter_by(from_member_id=u.id).count()
        points += ref_count * 2
        
        mtg_count = db.session.query(meeting_attendees).filter_by(user_id=u.id).count()
        points += mtg_count * 2
        
        evt_count = db.session.query(event_attendees).filter_by(user_id=u.id).count()
        points += evt_count * 1
        
        oto_count = OneToOne.query.filter((OneToOne.member_id == u.id) | (OneToOne.with_member_id == u.id)).count()
        points += oto_count * 3
        
        status = 'Inactive'
        if points > 15:
            status = 'Active'
        elif points >= 7:
            status = 'Growing'
            
        result.append({
            'id': u.id,
            'name': u.name,
            'status': status,
            'points': points,
            'stats': {
                'referrals': ref_count,
                'meetings': mtg_count,
                'events': evt_count,
                'one_to_ones': oto_count
            }
        })
        
    return jsonify(result), 200
