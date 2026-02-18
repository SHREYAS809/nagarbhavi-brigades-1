from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class User:
    @staticmethod
    def create_user(data):
        user = {
            'name': data['name'],
            'email': data['email'],
            'password': data['password'],
            'role': data.get('role', 'member'),
            'business_category': data.get('business_category', ''),
            'phone': data.get('phone', ''),
            'membership_tier': data.get('membership_tier', 'Standard'),
            'status': 'active',
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.users.insert_one(user)

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({'email': email})

    @staticmethod
    def find_by_id(user_id):
        return mongo.db.users.find_one({'_id': ObjectId(user_id)})

    @staticmethod
    def get_all_users():
        return list(mongo.db.users.find())

    @staticmethod
    def update_user(user_id, data):
        return mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': data})

    @staticmethod
    def delete_user(user_id):
        return mongo.db.users.delete_one({'_id': ObjectId(user_id)})
