import os
import django
import sys

# Add the server directory to sys.path
# If this file is in server/, then dirname matches server/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from core.models import User

# Ensure Teacher
if not User.objects.filter(username='teacher').exists():
    User.objects.create_user(username='teacher', email='teacher@example.com', password='password123', role=User.Role.TEACHER, first_name='Teacher', last_name='User')
    print("Created teacher")
else:
    # Reset password to be sure
    u = User.objects.get(username='teacher')
    u.set_password('password123')
    u.save()
    print("Teacher exists (password reset)")

# Ensure Student
if not User.objects.filter(username='student').exists():
    User.objects.create_user(username='student', email='student@example.com', password='password123', role=User.Role.STUDENT, first_name='Student', last_name='User')
    print("Created student")
else:
    print("Student exists")
