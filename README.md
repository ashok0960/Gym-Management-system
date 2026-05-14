# Gym Management System - React + Django

A complete gym management system built with **React (Vite)** frontend and **Django REST Framework** backend.

## Features

- 🔐 User Authentication (JWT)
- 👥 Member Management
- 🏋️ Trainer Management
- 📅 Class Scheduling & Booking
- 💳 Membership Plans & Payments
- 📊 Admin Dashboard with Analytics
- ✅ Attendance Tracking
- 📱 Responsive Design (Mobile-friendly)

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router v6
- Axios
- React Hot Toast
- Heroicons
- Recharts (charts)

### Backend
- Django 6.0
- Django REST Framework
- JWT Authentication
- SQLite Database
- CORS Headers

## Setup Instructions

### Backend Setup

1. Navigate to the project root:
```bash
cd "d:\New folder\Gym"
```

2. Activate virtual environment:
```bash
myenv\Scripts\activate
```

3. Install dependencies (if not already installed):
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow django-jazzmin
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser (admin):
```bash
python manage.py createsuperuser
```

6. Start Django server:
```bash
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Usage

1. Open browser and go to `http://localhost:3000`
2. Register a new account or login
3. Default admin credentials (if created): Use the superuser you created

### Admin Features
- Manage members, trainers, and classes
- View analytics and reports
- Handle payments
- Track attendance

### Member Features
- Book classes
- View schedule
- Manage profile
- Track attendance
- View membership details

## Project Structure

```
Gym/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context (Auth, Theme, Notifications)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── accounts/                # User authentication app
├── classes/                 # Class management app
├── trainers/                # Trainer management app
├── memberships/             # Membership plans app
├── payments/                # Payment handling app
├── attendance/              # Attendance tracking app
├── dashboard/               # Dashboard analytics app
├── gym_backend/             # Django settings
└── manage.py

```

## API Endpoints

### Authentication
- POST `/api/accounts/register/` - Register new user
- POST `/api/accounts/login/` - Login
- POST `/api/token/refresh/` - Refresh JWT token
- GET `/api/accounts/profile/` - Get user profile
- PUT `/api/accounts/profile/update/` - Update profile

### Classes
- GET `/api/classes/list/` - List all classes
- POST `/api/classes/list/{id}/book/` - Book a class
- POST `/api/classes/list/{id}/cancel_booking/` - Cancel booking
- GET `/api/classes/list/my_bookings/` - Get user's bookings

### Trainers
- GET `/api/trainers/list/` - List all trainers
- POST `/api/trainers/list/` - Create trainer (admin)
- PUT `/api/trainers/list/{id}/` - Update trainer (admin)
- DELETE `/api/trainers/list/{id}/` - Delete trainer (admin)

### Memberships
- GET `/api/memberships/plans/` - List membership plans
- POST `/api/memberships/upgrade/` - Upgrade membership

### Payments
- GET `/api/payments/` - List payments
- POST `/api/payments/create/` - Create payment
- GET `/api/payments/history/` - Payment history

### Dashboard
- GET `/api/dashboard/stats/` - Get dashboard statistics

## Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=/api
VITE_APP_NAME=Gym Management System
```

## Troubleshooting

### CORS Issues
- Make sure Django backend is running on port 8000
- Vite proxy is configured to forward `/api` requests to `http://localhost:8000`

### Port Already in Use
- Backend: Change port in `python manage.py runserver 8001`
- Frontend: Change port in `vite.config.js` server.port

### Database Issues
- Delete `db.sqlite3` and run migrations again
- Make sure all apps are in `INSTALLED_APPS` in `settings.py`

## License

MIT License

## Support

For issues or questions, please create an issue in the repository.
