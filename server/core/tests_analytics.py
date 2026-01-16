from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from .models import User, AttendanceRecord, Classroom, Enrollment
from datetime import date, timedelta

class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create users
        self.teacher = User.objects.create_user(username='teacher', password='password123', role=User.Role.TEACHER)
        self.student1 = User.objects.create_user(username='student1', password='password123', role=User.Role.STUDENT)
        self.student2 = User.objects.create_user(username='student2', password='password123', role=User.Role.STUDENT)
        
        # Create attendance records for current month
        today = date.today()
        # Ensure we are testing the current month
        self.current_month_str = today.strftime('%Y-%m')
        
        # Student 1: 2 Present, 1 Absent
        AttendanceRecord.objects.create(student=self.student1, date=today, status=AttendanceRecord.Status.PRESENT)
        AttendanceRecord.objects.create(student=self.student1, date=today - timedelta(days=1), status=AttendanceRecord.Status.PRESENT)
        AttendanceRecord.objects.create(student=self.student1, date=today - timedelta(days=2), status=AttendanceRecord.Status.ABSENT, absence_reason="Sick")
        
        # Student 2: 1 Present, 0 Absent (only 1 record)
        AttendanceRecord.objects.create(student=self.student2, date=today, status=AttendanceRecord.Status.PRESENT)

    def test_class_monthly_summary(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('class_analytics') # Match urls.py name
        response = self.client.get(url, {'month': self.current_month_str})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        
        # Verify overall stats
        # Total records: 3 (s1) + 1 (s2) = 4
        self.assertEqual(data['stats']['total_records'], 4)
        # Total present: 2 (s1) + 1 (s2) = 3
        self.assertEqual(data['stats']['present_count'], 3)
        # Total absent: 1 (s1) = 1
        self.assertEqual(data['stats']['absent_count'], 1)
        # Rate: 3/4 * 100 = 75.0
        self.assertEqual(data['stats']['attendance_rate'], 75.0)
        
        # Verify daily breakdown
        # Just check if we have entries
        self.assertTrue(len(data['daily']) > 0)

    def test_student_monthly_summary(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('student_analytics') # Match urls.py name
        
        # Test Student 1
        response = self.client.get(url, {'month': self.current_month_str, 'student_id': self.student1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        
        self.assertEqual(data['stats']['total_days'], 3)
        self.assertEqual(data['stats']['present_days'], 2)
        self.assertEqual(data['stats']['absent_days'], 1)
        self.assertEqual(data['stats']['attendance_rate'], 66.7) # 2/3 * 100 approx 66.666
        
        # Check absence history
        self.assertEqual(len(data['absence_history']), 1)
        self.assertEqual(data['absence_history'][0]['reason'], "Sick")

    def test_permission_denied_for_student(self):
        self.client.force_authenticate(user=self.student1)
        url = reverse('class_analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
