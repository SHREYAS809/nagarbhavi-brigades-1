from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class Revenue:
    @staticmethod
    def create_revenue(data):
        revenue = {
            'member_id': ObjectId(data['member_id']), # Member who generated this revenue (Beneficiary)
            'created_by': ObjectId(data.get('created_by')), # Member who submitted/paid (Giver)
            'source': data['source'], # referral / membership
            'amount': float(data['amount']),
            'month': data.get('month', datetime.datetime.now().strftime('%B')),
            'notes': data.get('notes', ''),
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.revenue.insert_one(revenue)

    @staticmethod
    def get_all_revenue():
        return list(mongo.db.revenue.find())

    @staticmethod
    def update_revenue(revenue_id, data):
        return mongo.db.revenue.update_one({'_id': ObjectId(revenue_id)}, {'$set': data})

    @staticmethod
    def delete_revenue(revenue_id):
        return mongo.db.revenue.delete_one({'_id': ObjectId(revenue_id)})
