from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from .models import User, AttendanceRecord
from datetime import date, timedelta
import calendar

class BulkAttendanceRefinementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(username='teacher', password='pwd', role=User.Role.TEACHER)
        self.student = User.objects.create_user(username='student', password='pwd', role=User.Role.STUDENT)
        self.url = reverse('bulk_attendance')

    def test_future_date_prevention(self):
        """Test that bulk marking only marks up to today for the current month."""
        self.client.force_authenticate(user=self.teacher)
        today = date.today()
        month_str = today.strftime('%Y-%m')
        
        response = self.client.post(self.url, {
            'student_id': self.student.id,
            'month': month_str,
            'status': 'PRESENT',
            'overwrite': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify no records strictly AFTER today
        future_records = AttendanceRecord.objects.filter(
            student=self.student, 
            date__gt=today
        )
        self.assertFalse(future_records.exists())
        
        # Verify records exist up to today (assuming today is <= end of month)
        # Just check one record for today exists
        today_record = AttendanceRecord.objects.filter(
            student=self.student,
            date=today
        )
        self.assertTrue(today_record.exists())

    def test_overwrite_false_preserves_records(self):
        """Test that overwrite=False preserves existing records."""
        self.client.force_authenticate(user=self.teacher)
        today = date.today()
        month_str = today.strftime('%Y-%m')
        
        # 1. Create an existing ABSENT record for yesterday (or today)
        target_date = today
        AttendanceRecord.objects.create(
            student=self.student,
            date=target_date,
            status='ABSENT',
            absence_reason='Sick'
        )
        
        # 2. Bulk mark PRESENT with overwrite=False
        response = self.client.post(self.url, {
            'student_id': self.student.id,
            'month': month_str,
            'status': 'PRESENT',
            'overwrite': False
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Verify target_date is still ABSENT
        record = AttendanceRecord.objects.get(student=self.student, date=target_date)
        self.assertEqual(record.status, 'ABSENT')
        self.assertEqual(record.absence_reason, 'Sick')
        
    def test_overwrite_true_replaces_records(self):
        """Test that overwrite=True replaces existing records."""
        self.client.force_authenticate(user=self.teacher)
        today = date.today()
        month_str = today.strftime('%Y-%m')
        
        # 1. Create an existing ABSENT record
        target_date = today
        AttendanceRecord.objects.create(
            student=self.student,
            date=target_date,
            status='ABSENT',
            absence_reason='Sick'
        )
        
        # 2. Bulk mark PRESENT with overwrite=True
        response = self.client.post(self.url, {
            'student_id': self.student.id,
            'month': month_str,
            'status': 'PRESENT',
            'overwrite': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Verify target_date is now PRESENT
        record = AttendanceRecord.objects.get(student=self.student, date=target_date)
        self.assertEqual(record.status, 'PRESENT')
        # Reason should be gone (or technically we didn't wipe it but status changed. 
        # Actually our implementation deletes and recreates, so reason is gone)
        
    def test_bulk_mark_previous_month(self):
        """Test bulk marking for a past month creates all days."""
        self.client.force_authenticate(user=self.teacher)
        
        # Calculate a past month
        today = date.today()
        first_of_month = date(today.year, today.month, 1)
        last_month_end = first_of_month - timedelta(days=1)
        last_month_str = last_month_end.strftime('%Y-%m')
        
        response = self.client.post(self.url, {
            'student_id': self.student.id,
            'month': last_month_str,
            'status': 'PRESENT',
            'overwrite': True
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify whole month is marked
        num_days = calendar.monthrange(last_month_end.year, last_month_end.month)[1]
        count = AttendanceRecord.objects.filter(
            student=self.student,
            date__year=last_month_end.year,
            date__month=last_month_end.month
        ).count()
        self.assertEqual(count, num_days)
