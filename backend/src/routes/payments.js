const express = require("express");
const { getDb } = require("../database");

const router = express.Router();

// POST /api/payments — mock payment processing [FR-6]
// Accepts { reservationId, method } and simulates a successful payment.
// Updates reservation status to CONFIRMED and room status to BOOKED.
router.post("/", (req, res) => {
  const { reservationId, method } = req.body;

  if (!reservationId) {
    return res.status(400).json({ error: "reservationId is required." });
  }

  const db = getDb();

  const reservation = db
    .prepare("SELECT * FROM reservations WHERE reservationId = ?")
    .get(reservationId);

  if (!reservation) {
    return res.status(404).json({ error: "Reservation not found." });
  }

  if (reservation.status !== "PENDING") {
    return res.status(409).json({ error: "Only PENDING reservations can be paid." });
  }

  // Run the full payment flow in a transaction (atomicity)
  const processPayment = db.transaction(() => {
    // 1. Create payment record with status COMPLETED
    const paymentResult = db
      .prepare(
        `INSERT INTO payments (reservationId, amount, paymentDate, method, status)
         VALUES (?, ?, ?, ?, 'COMPLETED')`
      )
      .run(
        reservationId,
        reservation.totalAmount,
        new Date().toISOString().split("T")[0],
        method || "Credit Card"
      );

    // 2. Update reservation status to CONFIRMED
    db.prepare("UPDATE reservations SET status = 'CONFIRMED' WHERE reservationId = ?").run(
      reservationId
    );

    // 3. Update room status to BOOKED
    db.prepare("UPDATE rooms SET status = 'BOOKED' WHERE roomId = ?").run(reservation.roomId);

    return paymentResult.lastInsertRowid;
  });

  const paymentId = processPayment();

  const payment = db.prepare("SELECT * FROM payments WHERE paymentId = ?").get(paymentId);
  const updatedReservation = db
    .prepare(
      `SELECT r.*, c.fullName, c.email, rm.roomNumber
       FROM reservations r
       JOIN customers c ON r.customerId = c.customerId
       JOIN rooms rm ON r.roomId = rm.roomId
       WHERE r.reservationId = ?`
    )
    .get(reservationId);

  res.status(201).json({ payment, reservation: updatedReservation });
});

module.exports = router;
