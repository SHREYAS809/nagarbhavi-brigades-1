from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class Notification:
    @staticmethod
    def create_notification(data):
        notification = {
            'user_id': ObjectId(data['user_id']),
            'type': data['type'], # referral, event, member
            'message': data['message'],
            'read_status': False,
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.notifications.insert_one(notification)

    @staticmethod
    def get_by_user(user_id):
        return list(mongo.db.notifications.find({'user_id': ObjectId(user_id)}))

    @staticmethod
    def mark_as_read(notification_id):
        return mongo.db.notifications.update_one({'_id': ObjectId(notification_id)}, {'$set': {'read_status': True}})
