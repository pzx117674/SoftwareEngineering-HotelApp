const path = require("path");
const Database = require("better-sqlite3");
const { seed } = require("./seed");

const DB_PATH = path.join(__dirname, "..", "hotel.db");

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createTables(db);

  const roomCount = db.prepare("SELECT COUNT(*) AS cnt FROM rooms").get();
  if (roomCount.cnt === 0) {
    seed(db);
    console.log("[DB] Database seeded with initial data.");
  }

  const staffCount = db.prepare("SELECT COUNT(*) AS cnt FROM staff").get();
  if (staffCount.cnt === 0) {
    const { seedStaff } = require("./seed");
    seedStaff(db);
    console.log("[DB] Staff seeded.");
  }

  console.log("[DB] Connected to SQLite at", DB_PATH);
  return db;
}

function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      roomId      INTEGER PRIMARY KEY AUTOINCREMENT,
      roomNumber  TEXT    NOT NULL UNIQUE,
      capacity    INTEGER NOT NULL,
      pricePerNight REAL  NOT NULL,
      city        TEXT    NOT NULL DEFAULT 'Warsaw',
      description TEXT    NOT NULL DEFAULT '',
      imageUrl    TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'AVAILABLE'
                  CHECK (status IN ('AVAILABLE', 'BOOKED', 'MAINTENANCE'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      customerId  INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName    TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      phoneNumber TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reservations (
      reservationId INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId    INTEGER NOT NULL,
      roomId        INTEGER NOT NULL,
      checkInDate   TEXT    NOT NULL,
      checkOutDate  TEXT    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
      totalAmount   REAL    NOT NULL,
      FOREIGN KEY (customerId) REFERENCES customers(customerId),
      FOREIGN KEY (roomId)     REFERENCES rooms(roomId)
    );

    CREATE TABLE IF NOT EXISTS payments (
      paymentId     INTEGER PRIMARY KEY AUTOINCREMENT,
      reservationId INTEGER NOT NULL,
      amount        REAL    NOT NULL,
      paymentDate   TEXT    NOT NULL,
      method        TEXT    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'UNPAID'
                    CHECK (status IN ('UNPAID', 'COMPLETED', 'REFUNDED')),
      FOREIGN KEY (reservationId) REFERENCES reservations(reservationId)
    );

    CREATE TABLE IF NOT EXISTS staff (
      staffId   INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName  TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      username  TEXT    NOT NULL UNIQUE,
      password  TEXT    NOT NULL,
      role      TEXT    NOT NULL
                CHECK (role IN ('RECEPTIONIST', 'MANAGER', 'MARKETING'))
    );
  `);
}

module.exports = { getDb };
