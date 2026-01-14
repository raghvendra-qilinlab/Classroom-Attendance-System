from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, StudentSerializer, AttendanceRecordSerializer
from .models import User, AttendanceRecord
from django.db import transaction
from datetime import datetime

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class StudentListView(generics.ListAPIView):
    queryset = User.objects.filter(role=User.Role.STUDENT)
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

class AttendanceListView(generics.ListAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        date = self.request.query_params.get('date')
        if not date:
            return AttendanceRecord.objects.none()
        return AttendanceRecord.objects.filter(date=date)

class AttendanceUpsertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Expects: { date: 'YYYY-MM-DD', records: [ { student_id: 1, status: 'PRESENT' }, ... ] }
        date = request.data.get('date')
        records = request.data.get('records', [])

        if not date:
            return Response({'error': 'Date is required'}, status=400)

        response_data = []
        
        with transaction.atomic():
            for record in records:
                student_id = record.get('student_id')
                status = record.get('status')
                
                if not student_id or not status:
                    continue

                obj, created = AttendanceRecord.objects.update_or_create(
                    date=date,
                    student_id=student_id,
                    defaults={
                        'status': status,
                        'marked_by': request.user
                    }
                )
                response_data.append(AttendanceRecordSerializer(obj).data)
        
        return Response(response_data)

# Student APIs
class StudentAttendanceListView(generics.ListAPIView):
    """
    Get attendance records for the authenticated student for a specific month.
    Query parameter: month (YYYY-MM format)
    """
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Only students can access this endpoint
        if user.role != User.Role.STUDENT:
            return AttendanceRecord.objects.none()
        
        month = self.request.query_params.get('month')
        if not month:
            return AttendanceRecord.objects.none()
        
        try:
            # Parse month (YYYY-MM format)
            year, month_num = month.split('-')
            year = int(year)
            month_num = int(month_num)
            
            # Filter by student and month
            return AttendanceRecord.objects.filter(
                student=user,
                date__year=year,
                date__month=month_num
            ).order_by('date')
        except (ValueError, AttributeError):
            return AttendanceRecord.objects.none()

class StudentAbsenceReasonUpdateView(generics.UpdateAPIView):
    """
    Update absence reason for a specific attendance record.
    Only allows updates if:
    - Record belongs to the authenticated student
    - Record status is ABSENT
    """
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Only students can access this endpoint
        if user.role != User.Role.STUDENT:
            return AttendanceRecord.objects.none()
        
        # Only return records that belong to this student
        return AttendanceRecord.objects.filter(student=user)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Validate that the record is ABSENT
        if instance.status != AttendanceRecord.Status.ABSENT:
            return Response(
                {'error': 'Can only update absence reason for absent records'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only allow updating the absence_reason field
        absence_reason = request.data.get('absence_reason', '')
        instance.absence_reason = absence_reason
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
