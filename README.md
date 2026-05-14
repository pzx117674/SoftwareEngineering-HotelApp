# Hotel Reservation System (HRS)

A university Software Engineering prototype implementing a hotel room reservation system with customer booking and staff management features.

## Technology Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Backend   | Node.js, Express                  |
| Database  | SQLite (via better-sqlite3)       |
| Frontend  | React 19 (Vite)                   |
| Styling   | Tailwind CSS 4                    |
| Routing   | React Router 7                    |

The architecture follows a **client-server model**: the React frontend is built to static files and served directly by the Express backend. All API calls and the UI are served from a single origin (`localhost:3001`).

## Running with Docker (recommended)

The easiest way to run the app — no Node.js installation required.

### Prerequisites

- **Docker Desktop** — [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### Start

```bash
docker compose up --build
```

First build takes ~2-3 minutes (downloads base image, installs packages, compiles React). Subsequent starts take ~15 seconds thanks to Docker layer caching.

Open **http://localhost:3001** in your browser.

### Stop

```
Ctrl+C
```

or `docker compose down`

> **Note:** The SQLite database is created fresh inside the container on each first run and seeded with demo data automatically.

---

## Running locally (development)

### Prerequisites

- **Node.js** v18 or later — [https://nodejs.org](https://nodejs.org)
- **npm** (included with Node.js)

### 1. Install dependencies

```bash
# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Start both servers

```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend in a second terminal (port 5173)
cd frontend && npm run dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3001 |

### Reset the database

```bash
rm backend/hotel.db
```

Restart the backend — it recreates and re-seeds automatically.

---

## Using the Application

- **Customer view** (`/`): Search available rooms by dates, view prices, book a room, complete a mock payment.
- **Staff dashboard** (`/dashboard`): View all rooms and their statuses, change room status (Available / Booked / Maintenance), view all reservations.

---

## Project Structure

```
SoftwareEngineering-HotelApp/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── backend/
│   ├── package.json
│   ├── hotel.db                 # Created at runtime (gitignored)
│   └── src/
│       ├── index.js             # Express server + serves frontend dist/
│       ├── database.js          # SQLite init & schema
│       ├── seed.js              # Demo data
│       └── routes/
│           ├── auth.js
│           ├── rooms.js
│           ├── reservations.js
│           └── payments.js
└── frontend/
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── RoomCard.jsx
        │   ├── GuestPicker.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── HomePage.jsx
            ├── SearchPage.jsx
            ├── BookingPage.jsx
            ├── ConfirmationPage.jsx
            ├── AccountPage.jsx
            ├── LoginPage.jsx
            ├── UserLoginPage.jsx
            └── DashboardPage.jsx
```

---

## API Endpoints

| Method | Endpoint                                  | Description                          |
| ------ | ----------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/login`                         | Login                                |
| POST   | `/api/auth/logout`                        | Logout                               |
| GET    | `/api/auth/me`                            | Current session                      |
| GET    | `/api/rooms`                              | List all rooms (staff)               |
| GET    | `/api/rooms/available?checkIn=&checkOut=` | Search available rooms by dates      |
| GET    | `/api/rooms/featured`                     | Featured rooms for homepage          |
| GET    | `/api/rooms/cities`                       | List available cities                |
| GET    | `/api/rooms/:id`                          | Get room details                     |
| PATCH  | `/api/rooms/:id/status`                   | Update room status (staff)           |
| POST   | `/api/reservations`                       | Create a PENDING reservation         |
| GET    | `/api/reservations`                       | List all reservations (staff)        |
| GET    | `/api/reservations/my`                    | List current user's reservations     |
| PATCH  | `/api/reservations/:id/cancel`            | Cancel a reservation                 |
| POST   | `/api/payments`                           | Process mock payment → CONFIRMED     |

---

## Database Schema

- **rooms** — roomId, roomNumber, capacity, pricePerNight, city, description, imageUrl, status (`AVAILABLE` / `BOOKED` / `MAINTENANCE`)
- **customers** — customerId, fullName, email, phoneNumber
- **reservations** — reservationId, customerId, roomId, checkInDate, checkOutDate, status (`PENDING` / `CONFIRMED` / `CANCELLED`), totalAmount
- **payments** — paymentId, reservationId, amount, paymentDate, method, status (`UNPAID` / `COMPLETED` / `REFUNDED`)

---

## SRS Requirements Coverage

| Requirement | Description                     | Implementation                          |
| ----------- | ------------------------------- | --------------------------------------- |
| FR-1        | Search available rooms by dates | `GET /api/rooms/available` + SearchPage |
| FR-2        | View room prices and details    | RoomCard + room endpoint                |
| FR-3        | Create/view/manage reservations | BookingPage + reservation endpoints     |
| FR-4        | Reception dashboard             | DashboardPage                           |
| FR-5        | Manage room availability        | Status dropdown on DashboardPage        |
| FR-6        | Process reservation payments    | Mock payment endpoint + BookingPage     |

---

## Team

- Bartosz Garba
- Damian Barłożek
- Krzysztof Cholewa
- Ivan-Antonii Zamishchak
