import os
import django
from rest_framework.test import APIRequestFactory
from auth_app.views import RegisterView
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bankrisk_backend.settings')
django.setup()

def test_register():
    factory = APIRequestFactory()
    view = RegisterView.as_view()
    data = {
        "email": "diagnostic@example.com",
        "first_name": "Diag",
        "last_name": "Test",
        "password": "Password123"
    }
    request = factory.post('/api/auth/register/', data, format='json')
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
    except Exception as e:
        print(f"Exception during registration: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_register()
