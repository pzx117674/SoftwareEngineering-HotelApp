const express = require("express");
const { getDb } = require("../database");
const { authMiddleware } = require("./auth");

const router = express.Router();

// GET /api/reservations/my — list logged-in user's reservations
router.get("/my", authMiddleware, (req, res) => {
  const db = getDb();
  const reservations = db
    .prepare(
      `SELECT r.*, c.fullName, c.email, rm.roomNumber, rm.city, rm.imageUrl
       FROM reservations r
       JOIN customers c ON r.customerId = c.customerId
       JOIN rooms rm ON r.roomId = rm.roomId
       WHERE c.email = ?
       ORDER BY r.reservationId DESC`
    )
    .all(req.user.email);
  res.json(reservations);
});

// GET /api/reservations — list all reservations (staff) [FR-4]
router.get("/", (_req, res) => {
  const db = getDb();
  const reservations = db
    .prepare(
      `SELECT r.*, c.fullName, c.email, rm.roomNumber
       FROM reservations r
       JOIN customers c ON r.customerId = c.customerId
       JOIN rooms rm ON r.roomId = rm.roomId
       ORDER BY r.reservationId DESC`
    )
    .all();
  res.json(reservations);
});

// GET /api/reservations/:id — single reservation details
router.get("/:id", (req, res) => {
  const db = getDb();
  const reservation = db
    .prepare(
      `SELECT r.*, c.fullName, c.email, c.phoneNumber, rm.roomNumber, rm.pricePerNight
       FROM reservations r
       JOIN customers c ON r.customerId = c.customerId
       JOIN rooms rm ON r.roomId = rm.roomId
       WHERE r.reservationId = ?`
    )
    .get(req.params.id);

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found." });
  }

  res.json(reservation);
});

// POST /api/reservations — create a new PENDING reservation [FR-3]
router.post("/", (req, res) => {
  const { fullName, email, phoneNumber, roomId, checkInDate, checkOutDate } = req.body;

  if (!fullName || !email || !phoneNumber || !roomId || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: "All fields are required: fullName, email, phoneNumber, roomId, checkInDate, checkOutDate." });
  }

  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ error: "checkOutDate must be after checkInDate." });
  }

  const db = getDb();

  // Verify room exists and is available
  const room = db.prepare("SELECT * FROM rooms WHERE roomId = ?").get(roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found." });
  }
  if (room.status !== "AVAILABLE") {
    return res.status(409).json({ error: "Room is not available." });
  }

  // Check for overlapping reservations
  const overlap = db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM reservations
       WHERE roomId = ?
         AND status IN ('CONFIRMED', 'PENDING')
         AND checkInDate < ?
         AND checkOutDate > ?`
    )
    .get(roomId, checkOutDate, checkInDate);

  if (overlap.cnt > 0) {
    return res.status(409).json({ error: "Room is already reserved for the selected dates." });
  }

  // Find or create customer
  let customer = db.prepare("SELECT * FROM customers WHERE email = ?").get(email);
  if (!customer) {
    const result = db
      .prepare("INSERT INTO customers (fullName, email, phoneNumber) VALUES (?, ?, ?)")
      .run(fullName, email, phoneNumber);
    customer = { customerId: result.lastInsertRowid };
  }

  // Calculate total amount
  const nights = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );
  const totalAmount = Math.round(nights * room.pricePerNight * 100) / 100;

  // Create PENDING reservation
  const result = db
    .prepare(
      `INSERT INTO reservations (customerId, roomId, checkInDate, checkOutDate, status, totalAmount)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`
    )
    .run(customer.customerId, roomId, checkInDate, checkOutDate, totalAmount);

  const reservation = db
    .prepare("SELECT * FROM reservations WHERE reservationId = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(reservation);
});

// PATCH /api/reservations/:id/cancel — cancel a reservation (user)
router.patch("/:id/cancel", authMiddleware, (req, res) => {
  const db = getDb();

  const reservation = db
    .prepare(
      `SELECT r.*, c.email
       FROM reservations r
       JOIN customers c ON r.customerId = c.customerId
       WHERE r.reservationId = ?`
    )
    .get(req.params.id);

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found." });
  }

  if (reservation.email !== req.user.email) {
    return res.status(403).json({ error: "You can only cancel your own reservations." });
  }

  if (reservation.status === "CANCELLED") {
    return res.status(400).json({ error: "Reservation is already cancelled." });
  }

  const cancelTx = db.transaction(() => {
    db.prepare("UPDATE reservations SET status = 'CANCELLED' WHERE reservationId = ?").run(
      req.params.id
    );

    if (reservation.status === "CONFIRMED") {
      db.prepare("UPDATE rooms SET status = 'AVAILABLE' WHERE roomId = ?").run(
        reservation.roomId
      );
    }
  });

  cancelTx();

  const updated = db.prepare("SELECT * FROM reservations WHERE reservationId = ?").get(req.params.id);
  res.json(updated);
});

module.exports = router;
