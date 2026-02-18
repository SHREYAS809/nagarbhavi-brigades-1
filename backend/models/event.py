from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class Event:
    @staticmethod
    def create_event(data):
        event = {
            'title': data['title'],
            'description': data['description'],
            'date': data['date'],
            'location': data['location'],
            'registered_members': [],
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.events.insert_one(event)

    @staticmethod
    def get_all_events():
        return list(mongo.db.events.find())

    @staticmethod
    def register_user(event_id, user_id):
        return mongo.db.events.update_one(
            {'_id': ObjectId(event_id)},
            {'$addToSet': {'registered_members': ObjectId(user_id)}}
        )

    @staticmethod
    def cancel_registration(event_id, user_id):
        return mongo.db.events.update_one(
            {'_id': ObjectId(event_id)},
            {'$pull': {'registered_members': ObjectId(user_id)}}
        )

    @staticmethod
    def delete_event(event_id):
        return mongo.db.events.delete_one({'_id': ObjectId(event_id)})
