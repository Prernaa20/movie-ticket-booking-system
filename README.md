# CinePass - Full-Stack Movie Ticket Booking System

A production-quality, full-stack **Movie Ticket Booking System** built with **FastAPI**, **MongoDB Atlas**, **React 18 (Vite)**, and a **Cinematic Glassmorphism Design System**.

---

## 🌟 Key Features

- 🔒 **JWT & Bcrypt Security**: Stateless token-based authentication with SHA-256 pre-hashing and bcrypt password encryption.
- ⚡ **Atomic Seat Allocation**: Conflict-free, real-time seat locking using MongoDB `$addToSet` and `$nin` operators to eliminate race conditions and double bookings.
- 🎬 **Dynamic Catalog & Search**: Case-insensitive regex title search, genre multi-filtering, audio language filters, and server-side pagination (`page`, `limit`, `total_pages`).
- 🎟️ **Interactive Seat Selector Grid**: Curved cinema screen graphic, seat state indicators (`Available`, `Selected`, `Reserved/Booked`), max-seat limit enforcement, and live subtotal/fee calculation.
- 📱 **Digital Ticket Receipts**: Unique ticket confirmation code (`CP-XXXXXX`), QR code entry graphic, and printable receipt trigger (`window.print()`).
- 🛡️ **Administrator Portal**: Real-time business metrics (total revenue, bookings, user count), interactive Movie CRUD modal, and showtime schedule builder.
- ⚡ **Zero-Setup Database Fallback**: Built-in `mongomock-motor` async in-memory database fallback ensuring out-of-the-box execution even without local MongoDB.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Backend Framework** | FastAPI (Python 3.10) | Uvicorn, Pydantic v2, Pydantic-Settings |
| **Database** | MongoDB Atlas / Motor | AsyncIOMotorClient, Mongomock-Motor |
| **Security & Auth** | JWT & Bcrypt | `python-jose`, `passlib[bcrypt]` |
| **Frontend UI** | React 18 & Vite | React Router v6, Axios, Lucide React |
| **Styling** | Vanilla CSS Design System | Glassmorphic Cards, Outfit & Inter Fonts |
| **Deployment** | Render (Backend) & Vercel (Frontend) | `render.yaml`, `vercel.json` |

---

## 📁 Repository Structure

```
movieProject/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                  # JWT Auth & Admin role security dependencies
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── admin.py         # Dashboard metrics & aggregation pipeline
│   │   │       │   ├── auth.py          # Register, Login, Me endpoints
│   │   │       │   ├── bookings.py      # Ticket reservation & cancellation APIs
│   │   │       │   ├── movies.py        # Movie CRUD, search, filter, pagination
│   │   │       │   └── shows.py         # Showtime scheduling & seat layout matrix
│   │   │       └── router.py            # API V1 router aggregator
│   │   ├── core/
│   │   │   ├── config.py                # Central Pydantic settings & env loader
│   │   │   └── security.py              # SHA256 + Bcrypt hashing & JWT generator
│   │   ├── db/
│   │   │   ├── mongodb.py               # Motor async client & mongomock fallback
│   │   │   └── seed.py                  # Automatic database seeder
│   │   ├── schemas/
│   │   │   ├── booking.py               # Booking & admin metrics Pydantic models
│   │   │   ├── movie.py                 # Movie request & response Pydantic models
│   │   │   ├── show.py                  # Show & seat layout Pydantic models
│   │   │   └── user.py                  # User & token Pydantic models
│   │   └── main.py                      # FastAPI lifespan application entrypoint
│   ├── .env.example                     # Backend environment template
│   ├── Procfile                         # Render start command
│   ├── render.yaml                      # Render build manifest
│   └── requirements.txt                 # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                   # Movie & Show creation modals
│   │   │   ├── auth/                    # ProtectedRoute and AdminRoute guards
│   │   │   ├── booking/                 # TicketReceiptModal with QR code
│   │   │   ├── layout/                  # Navbar & Footer
│   │   │   └── movies/                  # HeroBanner & MovieCard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # JWT state & localStorage persistence
│   │   │   └── ToastContext.jsx         # Notification alert provider
│   │   ├── pages/
│   │   │   ├── admin/                   # AdminDashboardPage
│   │   │   ├── auth/                    # LoginPage & RegisterPage
│   │   │   ├── booking/                 # SeatSelectorPage
│   │   │   └── movies/                  # MovieCatalogPage & MovieDetailsPage
│   │   ├── services/
│   │   │   └── api.js                   # Axios client with JWT interceptor
│   │   ├── App.jsx                      # Main router shell
│   │   └── index.css                    # Design system tokens & utility classes
│   ├── vercel.json                      # Vercel SPA rewrite manifest
│   └── package.json                     # Frontend dependencies
├── .gitignore                           # Git ignore definitions
└── README.md                            # Comprehensive project guide
```

---

## ⚡ Quick Start & Local Setup

### 1. Backend Setup

```powershell
# Navigate to backend folder
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- **API Health Check**: `http://localhost:8000/api/v1/health`
- **Swagger Documentation UI**: `http://localhost:8000/docs`

### 2. Frontend Setup

```powershell
# Navigate to frontend folder
cd frontend

# Install node dependencies
npm install

# Launch Vite dev server
npm run dev
```
- Open `http://localhost:5173` in your browser.

---

## 📡 REST API Reference Summary

| Endpoint | Method | Auth Level | Description |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/register` | `POST` | Public | Customer registration & token return |
| `POST /api/v1/auth/login` | `POST` | Public | Credential validation & JWT token return |
| `GET /api/v1/auth/me` | `GET` | Bearer Token | Fetch current user profile |
| `GET /api/v1/movies` | `GET` | Public | Catalog listing with search, genre, language, page |
| `GET /api/v1/movies/{id}` | `GET` | Public | Get single movie details |
| `POST /api/v1/movies` | `POST` | Admin Only | Add new movie to catalog |
| `PUT /api/v1/movies/{id}` | `PUT` | Admin Only | Edit existing movie details |
| `DELETE /api/v1/movies/{id}` | `DELETE` | Admin Only | Delete movie & associated showtimes |
| `POST /api/v1/shows` | `POST` | Admin Only | Schedule new showtime |
| `GET /api/v1/shows/movie/{id}`| `GET` | Public | Get showtimes for a movie |
| `GET /api/v1/shows/{id}` | `GET` | Public | Get showtime details & seat availability grid |
| `POST /api/v1/bookings` | `POST` | Bearer Token | Atomic seat allocation & ticket creation |
| `GET /api/v1/bookings/my-bookings`| `GET` | Bearer Token | User ticket history |
| `POST /api/v1/bookings/{id}/cancel`| `POST` | Bearer Token | Cancel booking & release seats |
| `GET /api/v1/admin/dashboard` | `GET` | Admin Only | Analytics dashboard revenue & stats |

---

## 🌐 Production Deployment Guide

### Deploying Backend to Render
1. Push repository to GitHub.
2. Create a new **Web Service** on Render and select your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `pip install -r requirements.txt`.
5. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variable `MONGODB_URL` with your MongoDB Atlas Cluster URI.

### Deploying Frontend to Vercel
1. Import repository on Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework Preset will automatically detect **Vite**.
4. Set Environment Variable `VITE_API_BASE_URL` to your Render backend API URL (e.g. `https://cinepass-api.onrender.com/api/v1`).

---

## 🎓 College Viva Voce Defense Q&A

> **Q1: Why use FastAPI over Flask or Django?**
> *Answer*: FastAPI offers native asynchronous I/O (`async/await`), automatic OpenAPI/Swagger documentation generation, automatic Pydantic type validation, and execution speed comparable to NodeJS and Go.

> **Q2: How do you handle concurrency and prevent double seat bookings?**
> *Answer*: We use MongoDB's atomic `$nin` and `$addToSet` operators inside `find_one_and_update`. The query checks that requested seats do NOT exist in `booked_seats` and adds them in a single atomic database operation. If two users click at the exact same millisecond, only the first request succeeds while the second receives an HTTP 400 seat conflict error.

> **Q3: How is password security implemented?**
> *Answer*: Passwords are pre-hashed using SHA-256 to create a 64-character digest, then salted and stretched using Bcrypt. Raw passwords are never logged or stored.

> **Q4: How does JWT stateless authentication work?**
> *Answer*: Upon login, the server signs a JSON Web Token containing claims (`sub: email`, `role: admin|user`, `exp: expiration`). The frontend stores this in `localStorage` and includes it in every API request as `Authorization: Bearer <token>`. FastAPI dependencies decode and verify the token signature without querying session tables.
