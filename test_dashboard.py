import requests

API_URL = 'http://127.0.0.1:5000/api'

def test():
    # Login
    res = requests.post(f'{API_URL}/auth/login', json={'email': 'admin@nagarbhavi.com', 'password': 'admin'})
    if res.status_code != 200:
        # Try alternate password
        res = requests.post(f'{API_URL}/auth/login', json={'email': 'admin@nagarbhavi.com', 'password': 'admin123'})
        if res.status_code != 200:
            print("Failed to login", res.text)
            return
            
    token = res.json().get('token')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test Dashboard Endpoints
    print("Testing GET /referrals/")
    print(requests.get(f'{API_URL}/referrals/', headers=headers).text[:200])
    
    print("\nTesting GET /revenue/")
    print(requests.get(f'{API_URL}/revenue/', headers=headers).text[:200])
    
    print("\nTesting GET /meetings/")
    print(requests.get(f'{API_URL}/meetings/', headers=headers).text[:200])
    
    print("\nTesting GET /users")
    print(requests.get(f'{API_URL}/users/', headers=headers).text[:200])
    
    # Test Create Meeting
    print("\nTesting POST /meetings/")
    payload = {
        "title": "Test Meeting",
        "date": "2026-10-10",
        "time": "10:00",
        "location": "Zoom",
        "description": "Test",
        "fee": 0
    }
    print(requests.post(f'{API_URL}/meetings/', headers=headers, json=payload).text)

if __name__ == '__main__':
    test()
