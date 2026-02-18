from backend.utils.extensions import mongo
from bson.objectid import ObjectId
import datetime

class Meeting:
    @staticmethod
    def create_meeting(data):
        meeting = {
            'title': data['title'],
            'date_time': data['date_time'],
            'location': data['location'],
            'participants': data.get('participants', []),
            'notes': data.get('notes', ''),
            'created_at': datetime.datetime.utcnow()
        }
        return mongo.db.meetings.insert_one(meeting)

    @staticmethod
    def get_all_meetings():
        return list(mongo.db.meetings.find())

    @staticmethod
    def update_meeting(meeting_id, data):
        return mongo.db.meetings.update_one({'_id': ObjectId(meeting_id)}, {'$set': data})

    @staticmethod
    def delete_meeting(meeting_id):
        return mongo.db.meetings.delete_one({'_id': ObjectId(meeting_id)})

    @staticmethod
    def add_participant(meeting_id, user_id):
        return mongo.db.meetings.update_one(
            {'_id': ObjectId(meeting_id)},
            {'$addToSet': {'participants': str(user_id)}}
        )
