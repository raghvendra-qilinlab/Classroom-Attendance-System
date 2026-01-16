# Classroom Attendance System (CAS)

A modern, full-stack attendance management system built with Django (Backend) and React (Frontend).

## Features
- **Teacher Dashboard**: 
  - Manage daily attendance (mark present/absent).
  - Bulk attendance marking for multiple days.
  - View detailed analytics (class performance, student reports).
- **Student Dashboard**: 
  - View monthly attendance calendar.
  - Submit reasons for absences.
  - Track personal attendance statistics.
- **Authentication**: Secure login for teachers and students.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS (v3), Lucide React
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (default)

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)

## Setup Instructions

### 1. Backend Setup (Django)

Navigate to the server directory:
```bash
cd server
```

Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt psutil
```

Run migrations:
```bash
python manage.py migrate
```

Seed initial data (creates sample teacher and students):
```bash
python manage.py seed_data
```

Start the server:
```bash
python manage.py runserver
```
The backend will run at `http://localhost:8000`.

### 2. Frontend Setup (React)

Navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will run at `http://localhost:5173`.

## Sample Credentials

### Teacher Account
- **Username**: `teacher`
- **Password**: `password123`

### Student Account
- **Username**: `student1`
- **Password**: `password123`
*(Students `student1` through `student10` are available)*

## Usage Guide
1.  **Login**: Use the credentials above to log in as a teacher or student.
2.  **Teacher**:
    -   Go to **Daily Attendance** to mark today's attendance.
    -   Use **Bulk Mark** to fill attendance for a date range.
    -   Visit **Analytics** to see charts and reports.
3.  **Student**:
    -   View your "My Attendance" calendar.
    -   Click on red "Absent" days to provide a reason for absence.

## Environment Variables
The project uses default Django settings for development. No `.env` file is required for local setup.
