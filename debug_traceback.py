from backend.app import create_app
import json

app = create_app()
client = app.test_client()

print("Testing login with test client...")
payload = {
    "email": "admin@nagarbhavi.com",
    "password": "admin123"
}

with app.test_request_context():
    response = client.post('/api/auth/login', 
                          data=json.dumps(payload),
                          content_type='application/json')
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 500:
        print("DETECTED 500 ERROR. Check server output above for traceback if running in debug mode or if caught by Flask.")
        print(response.data.decode('utf-8'))
    else:
        print("No 500 error detected in this test run.")
