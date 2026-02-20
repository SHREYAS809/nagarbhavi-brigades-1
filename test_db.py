import requests

url = "https://nagarbhavi-brigades-backend.onrender.com/api/auth/login"
resp = requests.post(url, json={"email": "admin@nagarbhavibrigades.com", "password": "admin123"})
print("Login status:", resp.status_code)
if resp.status_code == 200:
    token = resp.json().get("token")
    headers = {"Authorization": f"Bearer {token}"}
    
    urls = [
        "https://nagarbhavi-brigades-backend.onrender.com/api/referrals/",
        "https://nagarbhavi-brigades-backend.onrender.com/api/revenue/",
        "https://nagarbhavi-brigades-backend.onrender.com/api/meetings/",
        "https://nagarbhavi-brigades-backend.onrender.com/api/auth/users"
    ]
    
    url_meeting = "https://nagarbhavi-brigades-backend.onrender.com/api/meetings/"
    payload = {
        "title": "Test Meeting",
        "date": "2026-02-21",
        "time": "10:00",
        "location": "Online",
        "description": "Test",
        "type": "Chapter Meeting",
        "fee": 0,
        "organizer_id": "1"
    }
    r = requests.post(url_meeting, json=payload, headers=headers)
    print("Create meeting status:", r.status_code)
    print("Response:", r.text)
else:
    print("Failed to login", resp.text)
