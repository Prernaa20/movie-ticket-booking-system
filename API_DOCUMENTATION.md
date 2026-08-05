# CinePass REST API Specifications & Documentation

Official REST API documentation for the **CinePass Movie Ticket Booking System**.

---

## 📌 General Information

- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **OpenAPI Schema Specification**: `http://localhost:8000/openapi.json`
- **Data Format**: JSON (`application/json`)
- **Authentication Scheme**: HTTP Bearer Token (`Authorization: Bearer <token>`)

---

## 🔒 Security & Authorization Headers

Protected endpoints require a valid JSON Web Token (JWT) passed in the HTTP Request Header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚦 HTTP Response Status Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | OK | Request succeeded. |
| `201` | Created | Resource successfully created. |
| `204` | No Content | Deletion operation completed. |
| `400` | Bad Request | Data validation error or duplicate email/seat conflict. |
| `401` | Unauthorized | Missing, invalid, or expired JWT bearer token. |
| `403` | Forbidden | Insufficient user role privileges (Admin access required). |
| `404` | Not Found | Requested resource ID does not exist in database. |
| `500` | Internal Server Error | Unhandled server exception. |

---

## 🛠️ API Endpoint Definitions

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
- **Description**: Registers a new customer account and returns a JWT access token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "full_name": "College Student",
    "email": "student@college.edu",
    "password": "Password123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": "65b9a101f82c019a2e3a1002",
      "full_name": "College Student",
      "email": "student@college.edu",
      "role": "user",
      "created_at": "2026-08-05T20:05:00.000Z"
    }
  }
  ```

#### `POST /api/v1/auth/login`
- **Description**: Authenticates email and password credentials.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@cinepass.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1...",
    "token_type": "bearer",
    "user": {
      "id": "65b9a101f82c019a2e3a1001",
      "full_name": "System Admin",
      "email": "admin@cinepass.com",
      "role": "admin",
      "created_at": "2026-08-05T20:00:00.000Z"
    }
  }
  ```

#### `GET /api/v1/auth/me`
- **Description**: Fetches profile information for currently authenticated user.
- **Access**: Protected (Bearer Token)
- **Response (200 OK)**:
  ```json
  {
    "id": "65b9a101f82c019a2e3a1001",
    "full_name": "System Admin",
    "email": "admin@cinepass.com",
    "role": "admin",
    "created_at": "2026-08-05T20:00:00.000Z"
  }
  ```

---

### 2. Movie Catalog Endpoints (`/api/v1/movies`)

#### `GET /api/v1/movies`
- **Description**: Retrieves a paginated list of movies with live search and multi-filtering.
- **Access**: Public
- **Query Parameters**:
  - `search` (string, optional): Title regex search.
  - `genre` (string, optional): Genre filter (e.g. `Sci-Fi`).
  - `language` (string, optional): Audio language (e.g. `English`).
  - `page` (integer, default: 1): Page number.
  - `limit` (integer, default: 8): Items per page.
- **Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": "65b9a101f82c019a2e3a2001",
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole...",
        "genre": ["Sci-Fi", "Adventure", "Drama"],
        "duration_mins": 169,
        "release_date": "2014-11-07",
        "language": "English",
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401",
        "rating": 8.7,
        "is_active": true,
        "created_at": "2026-08-05T20:00:00.000Z"
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 8,
    "total_pages": 1
  }
  ```

#### `GET /api/v1/movies/{id}`
- **Description**: Retrieves detailed information for a single movie.
- **Access**: Public

#### `POST /api/v1/movies`
- **Description**: Adds a new movie to the catalog.
- **Access**: Admin Only
- **Request Body**:
  ```json
  {
    "title": "Inception",
    "description": "A thief who steals corporate secrets...",
    "genre": ["Sci-Fi", "Action"],
    "duration_mins": 148,
    "release_date": "2010-07-16",
    "language": "English",
    "poster_url": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
    "rating": 8.8,
    "is_active": true
  }
  ```

#### `PUT /api/v1/movies/{id}`
- **Description**: Updates existing movie fields.
- **Access**: Admin Only

#### `DELETE /api/v1/movies/{id}`
- **Description**: Deletes a movie and associated showtimes.
- **Access**: Admin Only

---

### 3. Showtime & Seating Endpoints (`/api/v1/shows`)

#### `POST /api/v1/shows`
- **Description**: Schedules a new movie showtime.
- **Access**: Admin Only
- **Request Body**:
  ```json
  {
    "movie_id": "65b9a101f82c019a2e3a2001",
    "screen_name": "Screen 1 (IMAX)",
    "show_time": "2026-08-06T19:00:00",
    "price_per_seat": 12.50,
    "rows": 6,
    "cols": 10
  }
  ```

#### `GET /api/v1/shows/movie/{movie_id}`
- **Description**: Lists all scheduled showtimes for a movie.
- **Access**: Public

#### `GET /api/v1/shows/{id}`
- **Description**: Returns showtime details, screen matrix dimensions, and list of `booked_seats`.
- **Access**: Public
- **Response (200 OK)**:
  ```json
  {
    "id": "65b9a101f82c019a2e3a3001",
    "movie_id": "65b9a101f82c019a2e3a2001",
    "screen_name": "Screen 1 (IMAX)",
    "show_time": "2026-08-06T19:00:00",
    "price_per_seat": 12.50,
    "total_seats": 60,
    "rows": 6,
    "cols": 10,
    "booked_seats": ["A1", "A2", "A5", "A6"]
  }
  ```

---

### 4. Booking & Ticket Endpoints (`/api/v1/bookings`)

#### `POST /api/v1/bookings`
- **Description**: Atomically reserves selected seats and returns digital ticket receipt.
- **Access**: Protected (Bearer Token)
- **Request Body**:
  ```json
  {
    "show_id": "65b9a101f82c019a2e3a3001",
    "seat_numbers": ["A5", "A6"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "65b9a101f82c019a2e3a4001",
    "booking_code": "CP-8F2A9C",
    "user_id": "65b9a101f82c019a2e3a1002",
    "show_id": "65b9a101f82c019a2e3a3001",
    "seat_numbers": ["A5", "A6"],
    "total_amount": 25.00,
    "status": "CONFIRMED",
    "created_at": "2026-08-05T20:30:00.000Z"
  }
  ```

#### `GET /api/v1/bookings/my-bookings`
- **Description**: Returns ticket history for the currently logged in customer.
- **Access**: Protected (Bearer Token)

#### `POST /api/v1/bookings/{id}/cancel`
- **Description**: Cancels booking ticket and atomically releases seats back to available pool.
- **Access**: Protected (Bearer Token)

---

### 5. Admin Analytics Endpoint (`/api/v1/admin`)

#### `GET /api/v1/admin/dashboard`
- **Description**: Fetches total revenue ($), total bookings, active movies, shows, and recent transactions.
- **Access**: Admin Only
- **Response (200 OK)**:
  ```json
  {
    "total_revenue": 150.00,
    "total_bookings": 12,
    "total_movies": 4,
    "total_shows": 24,
    "total_users": 5,
    "recent_bookings": []
  }
  ```
