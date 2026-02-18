from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class Referral:
    @staticmethod
    def create_referral(data):
        referral = {
            'from_member': ObjectId(data['from_member']), # User ID
            'to_member': ObjectId(data['to_member']), # User ID
            'contact_name': data['contact_name'],
            'phone': data['phone'],
            'email': data.get('email', ''),
            'referral_type': data.get('type', 'Tier 1'), # Tier 1, 2, 3
            'heat': data.get('heat', 'Hot'), # Hot, Warm, Cold
            'comments': data.get('comments', ''),
            'status': 'Open', # Open, Approved, Closed
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.referrals.insert_one(referral)

    @staticmethod
    def update_referral(referral_id, data):
         return mongo.db.referrals.update_one({'_id': ObjectId(referral_id)}, {'$set': data})

    @staticmethod
    def delete_referral(referral_id):
        return mongo.db.referrals.delete_one({'_id': ObjectId(referral_id)})

    @staticmethod
    def get_all_referrals():
        return list(mongo.db.referrals.find())
    
    @staticmethod
    def get_by_user(user_id):
        return list(mongo.db.referrals.find({'from_member': ObjectId(user_id)}))
