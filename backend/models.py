from backend.utils.extensions import db
from datetime import datetime
from flask_login import UserMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False) # Hashed password
    role = db.Column(db.String(20), default='member') # 'member' or 'admin'
    business_category = db.Column(db.String(100))
    business_name = db.Column(db.String(100))
    services_offered = db.Column(db.Text)
    phone = db.Column(db.String(20))
    chapter = db.Column(db.String(100), default='Nagarbhavi Brigades')
    membership_plan = db.Column(db.String(50), default='12 Months') # 'Lifetime', '6 Months', '12 Months'
    photo = db.Column(db.Text) # Base64 encoded image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    referrals_given = db.relationship('Referral', foreign_keys='Referral.from_member_id', back_populates='sender', lazy=True)
    referrals_received = db.relationship('Referral', foreign_keys='Referral.to_member_id', back_populates='receiver', lazy=True)
    
    # Revenue relationships
    revenue_generated = db.relationship('Revenue', foreign_keys='Revenue.member_id', back_populates='referrer', lazy=True) # Business given to others
    revenue_earned = db.relationship('Revenue', foreign_keys='Revenue.created_by', back_populates='recipient', lazy=True) # Business received/recorded
    
    meetings = db.relationship('Meeting', secondary='meeting_attendees', backref=db.backref('attendees', lazy='dynamic'))
    events = db.relationship('Event', secondary='event_attendees', backref=db.backref('attendees', lazy='dynamic'))

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    from_member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    to_member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    contact_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    referral_type = db.Column(db.String(20)) # Self / Others
    comments = db.Column(db.Text)
    status = db.Column(db.String(50), default='Open') # Open / Closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[from_member_id], back_populates='referrals_given')
    receiver = db.relationship('User', foreign_keys=[to_member_id], back_populates='referrals_received')

class Revenue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50)) # 'Thank You For Closed Business'
    member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Who gave the business (Referrer)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Who received the money and is recording it (Recipient)
    referral_id = db.Column(db.Integer, db.ForeignKey('referral.id'), nullable=True) # Optional link to a specific referral
    notes = db.Column(db.Text)
    appreciation_message = db.Column(db.Text)
    appreciation_reason = db.Column(db.Text)
    date = db.Column(db.String(20)) # Stored as string or Date object
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    referrer = db.relationship('User', foreign_keys=[member_id], back_populates='revenue_generated')
    recipient = db.relationship('User', foreign_keys=[created_by], back_populates='revenue_earned')

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(20))
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    type = db.Column(db.String(50), default='Chapter Meeting')
    fee = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    organized_by = db.Column(db.Integer, db.ForeignKey('user.id')) # Organizer

    organizer = db.relationship('User', backref=db.backref('meetings_organized', lazy=True))

# Association Table for Meeting Attendees
meeting_attendees = db.Table('meeting_attendees',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('meeting_id', db.Integer, db.ForeignKey('meeting.id'), primary_key=True)
)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Association Table for Event Attendees
event_attendees = db.Table('event_attendees',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True)
)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50)) # referral, broadcast, etc.
    message = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(200))
    content = db.Column(db.Text)
    read_status = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Broadcast(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(20), default='all') # all, member, admin
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    invited_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    visit_date = db.Column(db.String(20)) # Date of visit
    status = db.Column(db.String(50), default='Invited') # Invited, Visited, Joined, Follow-up
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    inviter = db.relationship('User', foreign_keys=[invited_by], backref=db.backref('guests_invited', lazy=True))

class LearningCredit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    source = db.Column(db.String(100)) # Podcast, Book, Training, Workshop
    duration_hours = db.Column(db.Float, default=1.0)
    date = db.Column(db.String(20), default=datetime.utcnow().strftime('%Y-%m-%d'))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    member = db.relationship('User', foreign_keys=[member_id], backref=db.backref('learning_credits', lazy=True))

class OneToOne(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Initiator
    with_member_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Partner
    date = db.Column(db.String(20), default=datetime.utcnow().strftime('%Y-%m-%d'))
    location = db.Column(db.String(200))
    topics_discussed = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    initiator = db.relationship('User', foreign_keys=[member_id], backref=db.backref('one_to_ones_initiated', lazy=True))
    partner = db.relationship('User', foreign_keys=[with_member_id], backref=db.backref('one_to_ones_received', lazy=True))
