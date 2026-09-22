# Vizzy — Step 1

Starter scaffold for the Vizzy AI visual storytelling assignment.

## Structure

- `frontend/` — Next.js + TypeScript + Tailwind CSS starter
- `backend/` — Django REST API starter structure

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Backend

Create a virtual environment and install:

```bash
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv groq
```

Then create the Django project/apps if needed:

```bash
django-admin startproject config backend
cd backend
python manage.py startapp projects
python manage.py startapp stories
python manage.py startapp generations
python manage.py migrate
python manage.py runserver
```

> This Step 1 ZIP intentionally contains the project scaffold and initial UI. Django configuration and API models will be built in Step 2.
