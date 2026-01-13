from django.core.management.base import BaseCommand
from core.models import User, Classroom, Enrollment

class Command(BaseCommand):
    help = 'Seeds initial data for CAS'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create Classroom
        classroom, created = Classroom.objects.get_or_create(name='Class 10-A')
        if created:
            self.stdout.write(f'Created classroom: {classroom.name}')

        # Create Teacher
        teacher, created = User.objects.get_or_create(
            username='teacher',
            defaults={
                'email': 'teacher@example.com',
                'role': User.Role.TEACHER,
                'first_name': 'John',
                'last_name': 'Doe'
            }
        )
        if created:
            teacher.set_password('password123')
            teacher.save()
            self.stdout.write(f'Created teacher: {teacher.username}')

        # Create Students
        for i in range(1, 11):
            username = f'student{i}'
            student, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'role': User.Role.STUDENT,
                    'first_name': f'Student',
                    'last_name': f'{i}'
                }
            )
            if created:
                student.set_password('password123')
                student.save()
                self.stdout.write(f'Created student: {student.username}')
            
            # Enroll
            Enrollment.objects.get_or_create(student=student, classroom=classroom)

        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))
