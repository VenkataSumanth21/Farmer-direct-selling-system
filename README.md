# Farmer Direct Selling System

A full-stack project based on the presentation "Farmer Direct Selling System".

The app connects farmers and customers directly so farmers can list produce, customers can order fresh products, and admins can track orders, payments, and platform activity.

## Tech Stack

- Frontend: React, Vite, HTML, CSS, JavaScript
- Backend: Python, Django, Django REST Framework
- Database: SQLite for local/demo deployment, configurable for production
- Deployment: Netlify frontend, Render backend

## Project Structure

```text
backend/   Django REST API
frontend/  React customer/farmer/admin interface
```

## Local Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API runs at `http://127.0.0.1:8000/api/`.

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

Set `VITE_API_BASE_URL` to the backend URL when deploying.

## Main Features

- Farmer registration and product upload
- Customer browsing and direct ordering
- Order tracking
- UPI/Razorpay-style payment status capture
- Admin dashboard metrics
- Transparent pricing and direct farmer-customer connection

## Deployment

### Render

The backend includes `render.yaml`. After pushing to GitHub, create a Render Blueprint from the repository or create a Web Service with:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt && python manage.py migrate && python manage.py seed_demo`
- Start command: `gunicorn farmer_api.wsgi:application`

### Netlify

The frontend includes `netlify.toml`.

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Environment variable: `VITE_API_BASE_URL=https://farmer-direct-selling-api.onrender.com/api`
