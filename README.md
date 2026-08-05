# CinePass - Movie Ticket Booking System

A modern, full-stack **Movie Ticket Booking System** built with **FastAPI**, **MongoDB Atlas**, **React**, and **Tailwind CSS**.

---

## Technical Stack

- **Backend Framework**: FastAPI (Python 3.10)
- **Database**: MongoDB Atlas (Async Motor ODM Driver)
- **Authentication**: JWT (JSON Web Tokens) + Passlib / Bcrypt Password Hashing
- **Frontend Framework**: React 18 (Vite)
- **Styling**: Modern CSS / Glassmorphism Design System
- **HTTP Client**: Axios
- **API Documentation**: Swagger UI / OpenAPI 3.0
- **Deployment Targets**: Render (Backend), Vercel (Frontend)

---

## Project Structure

```
movieProject/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── venv/
│   ├── .env
│   ├── .env.example
│   └── requirements.txt
├── frontend/
├── .gitignore
└── README.md
```

---

## Phase 1 Setup Instructions

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
3. Run FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Access Swagger API documentation at `http://localhost:8000/docs`.
