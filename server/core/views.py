from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, StudentSerializer, AttendanceRecordSerializer
from .models import User, AttendanceRecord
from django.db import transaction

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
