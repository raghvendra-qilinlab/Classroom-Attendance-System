from django.urls import path
from .views import (
    CustomTokenObtainPairView, 
    UserMeView,
    StudentListView,
    AttendanceListView,
    AttendanceUpsertView,
    StudentAttendanceListView,
    StudentAbsenceReasonUpdateView
)

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', UserMeView.as_view(), name='user_me'),
    
    # Teacher Routes
    path('teacher/students/', StudentListView.as_view(), name='student_list'),
    path('teacher/attendance/', AttendanceListView.as_view(), name='attendance_list'),
    path('teacher/attendance/mark/', AttendanceUpsertView.as_view(), name='attendance_mark'),
    
    # Student Routes
    path('student/attendance/', StudentAttendanceListView.as_view(), name='student_attendance_list'),
    path('student/attendance/<int:pk>/reason/', StudentAbsenceReasonUpdateView.as_view(), name='student_absence_reason_update'),
]
