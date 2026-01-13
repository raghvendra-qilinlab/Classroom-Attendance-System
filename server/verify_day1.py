import requests

BASE_URL = 'http://localhost:8000/api'

def test_api():
    # 1. Login as Teacher
    print("Testing Teacher Login...")
    response = requests.post(f'{BASE_URL}/auth/login/', json={
        'username': 'teacher',
        'password': 'password123'
    })
    if response.status_code == 200:
        print("Teacher Login Success")
        token = response.json()['access']
        role = response.json().get('role')
        print(f"Role: {role}")
        
        # 2. Check /me
        print("Testing /me endpoint...")
        headers = {'Authorization': f'Bearer {token}'}
        me_response = requests.get(f'{BASE_URL}/me/', headers=headers)
        if me_response.status_code == 200:
            print(f"/me Success: {me_response.json()}")
        else:
            print(f"/me Failed: {me_response.text}")
    else:
        print(f"Teacher Login Failed: {response.text}")

    # 3. Login as Student
    print("\nTesting Student Login...")
    response = requests.post(f'{BASE_URL}/auth/login/', json={
        'username': 'student1',
        'password': 'password123'
    })
    if response.status_code == 200:
        print("Student Login Success")
        print(f"Role: {response.json().get('role')}")
    else:
        print(f"Student Login Failed: {response.text}")

if __name__ == '__main__':
    try:
        test_api()
    except Exception as e:
        print(f"Test failed (is server running?): {e}")
