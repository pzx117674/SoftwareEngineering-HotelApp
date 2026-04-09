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

The architecture follows a **client-server model**: the React frontend communicates with the Express backend via REST API calls, and the backend persists data in a local SQLite file (`backend/hotel.db`).

## Prerequisites

- **Node.js** v18 or later — [https://nodejs.org](https://nodejs.org)
- **npm** (included with Node.js)

No external database server is required. SQLite runs in-process.

## Getting Started

### 1. Install Dependencies

From the project root:

```bash
npm install
npm run install:all
```

This installs:
- Root: `concurrently` (runs backend + frontend simultaneously)
- Backend: `express`, `better-sqlite3`, `cors`
- Frontend: `react`, `vite`, `tailwindcss`, `react-router-dom`

### 2. Start the Application

```bash
npm run dev
```

This starts both servers concurrently:

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:3001        |

On first launch, the backend automatically creates `backend/hotel.db` and seeds it with dummy data (10 rooms, 3 customers, sample reservations).

### 3. Use the Application

- **Customer View** (`/`): Search available rooms by dates, view prices, book a room, and complete a mock payment.
- **Staff Dashboard** (`/dashboard`): View all rooms and their statuses, change room status (Available / Booked / Maintenance), and view all reservations.

## Project Structure

```
SoftwareEngineering-HotelApp/
├── README.md
├── package.json                 # Root scripts (concurrently)
├── .gitignore
├── backend/
│   ├── package.json
│   ├── hotel.db                 # Created at runtime (gitignored)
│   └── src/
│       ├── index.js             # Express server entry point
│       ├── database.js          # SQLite init, schema creation
│       ├── seed.js              # Dummy data seeding
│       └── routes/
│           ├── rooms.js         # Room endpoints
│           ├── reservations.js  # Reservation endpoints
│           └── payments.js      # Payment endpoint
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx              # React Router setup
        ├── index.css            # Tailwind CSS import
        ├── components/
        │   ├── Layout.jsx       # Shared header/footer
        │   └── RoomCard.jsx     # Room display card
        └── pages/
            ├── SearchPage.jsx       # Customer: search rooms
            ├── BookingPage.jsx      # Customer: book + pay
            ├── ConfirmationPage.jsx # Customer: booking confirmed
            └── DashboardPage.jsx    # Staff: rooms & reservations
```

## API Endpoints

| Method | Endpoint                          | Description                        |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/api/rooms`                      | List all rooms (staff)             |
| GET    | `/api/rooms/available?checkIn=&checkOut=` | Search available rooms by dates |
| GET    | `/api/rooms/:id`                  | Get room details                   |
| PATCH  | `/api/rooms/:id/status`           | Update room status (staff)         |
| POST   | `/api/reservations`               | Create a PENDING reservation       |
| GET    | `/api/reservations`               | List all reservations (staff)      |
| POST   | `/api/payments`                   | Process mock payment → CONFIRMED   |

## SRS Requirements Coverage

| Requirement | Description                              | Implementation                    |
| ----------- | ---------------------------------------- | --------------------------------- |
| FR-1        | Search available rooms by dates          | `GET /api/rooms/available` + SearchPage |
| FR-2        | View room prices and details             | RoomCard component + room endpoint |
| FR-3        | Create/view/manage reservations          | BookingPage + reservation endpoints |
| FR-4        | Reception dashboard for occupancy        | DashboardPage rooms table          |
| FR-5        | Manage room availability                 | Status dropdown on DashboardPage   |
| FR-6        | Process reservation payments             | Mock payment endpoint + BookingPage |

## Database Schema

Four tables matching the SRS Class Diagram entities:

- **rooms** — roomId, roomNumber, capacity, pricePerNight, status (AVAILABLE/BOOKED/MAINTENANCE)
- **customers** — customerId, fullName, email, phoneNumber
- **reservations** — reservationId, customerId, roomId, checkInDate, checkOutDate, status (PENDING/CONFIRMED/CANCELLED), totalAmount
- **payments** — paymentId, reservationId, amount, paymentDate, method, status (UNPAID/COMPLETED/REFUNDED)

## Resetting the Database

To start fresh, delete the SQLite file and restart:

```bash
rm backend/hotel.db
npm run dev
```

The database will be recreated and re-seeded automatically.

## Team

- Bartosz Garba
- Damian Barłożek
- Krzysztof Cholewa
- Ivan-Antonii Zamishchak
