import requests
import sys

# API URL
API_URL = 'http://127.0.0.1:5000/api'

def test_login(email, password):
    print(f"Testing login for: {email}")
    try:
        response = requests.post(f'{API_URL}/auth/login', json={'email': email, 'password': password})
        if response.status_code == 200:
            print("Login SUCCESS!")
            print("Token:", response.json().get('token'))
        else:
            print(f"Login FAILED. Status: {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"Error connecting to API: {e}")

def list_users():
    # Only works if we have an admin token, but for now let's just try to hit the root
    try:
        r = requests.get('http://127.0.0.1:5000/')
        print(f"Server check: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Server check FAILED: {e}")

if __name__ == "__main__":
    list_users()
    test_login('admin@nagarbhavi.com', 'admin123')
    test_login('test@example.com', 'password123')
