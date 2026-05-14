const express = require("express");
const { getDb } = require("../database");

const router = express.Router();

// GET /api/reports — sales & trends data for manager (FR-7) and marketing (FR-8)
router.get("/", (_req, res) => {
  const db = getDb();

  // FR-7: Total revenue from completed payments
  const { totalRevenue } = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS totalRevenue FROM payments WHERE status = 'COMPLETED'")
    .get();

  // FR-7: Reservations count by status
  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS count FROM reservations GROUP BY status ORDER BY status")
    .all();

  // FR-7: Revenue and bookings by city
  const byCity = db
    .prepare(
      `SELECT rm.city,
              COUNT(r.reservationId)            AS bookings,
              COALESCE(SUM(p.amount), 0)        AS revenue
       FROM   reservations r
       JOIN   rooms rm ON r.roomId = rm.roomId
       LEFT JOIN payments p ON p.reservationId = r.reservationId AND p.status = 'COMPLETED'
       WHERE  r.status = 'CONFIRMED'
       GROUP  BY rm.city
       ORDER  BY revenue DESC`
    )
    .all();

  // FR-7: Monthly revenue (last 6 months, ascending for chart)
  const monthlyRevenue = db
    .prepare(
      `SELECT strftime('%Y-%m', paymentDate) AS month,
              SUM(amount)                    AS revenue,
              COUNT(*)                       AS payments
       FROM   payments
       WHERE  status = 'COMPLETED'
       GROUP  BY month
       ORDER  BY month DESC
       LIMIT  6`
    )
    .all()
    .reverse();

  // FR-8: Monthly bookings trend (last 12 months, ascending)
  const monthlyBookings = db
    .prepare(
      `SELECT strftime('%Y-%m', checkInDate) AS month,
              COUNT(*)                       AS bookings
       FROM   reservations
       WHERE  status != 'CANCELLED'
       GROUP  BY month
       ORDER  BY month DESC
       LIMIT  12`
    )
    .all()
    .reverse();

  // FR-8: Most popular cities by booking count
  const popularCities = db
    .prepare(
      `SELECT rm.city, COUNT(r.reservationId) AS bookings
       FROM   reservations r
       JOIN   rooms rm ON r.roomId = rm.roomId
       WHERE  r.status != 'CANCELLED'
       GROUP  BY rm.city
       ORDER  BY bookings DESC`
    )
    .all();

  // FR-8: Average stay duration
  const { avgNights } = db
    .prepare(
      `SELECT ROUND(AVG(julianday(checkOutDate) - julianday(checkInDate)), 1) AS avgNights
       FROM   reservations WHERE status = 'CONFIRMED'`
    )
    .get();

  // FR-8: Most booked payment methods
  const byMethod = db
    .prepare(
      `SELECT method, COUNT(*) AS count, SUM(amount) AS total
       FROM   payments WHERE status = 'COMPLETED'
       GROUP  BY method ORDER BY count DESC`
    )
    .all();

  res.json({
    totalRevenue,
    byStatus,
    byCity,
    monthlyRevenue,
    monthlyBookings,
    popularCities,
    avgNights: avgNights || 0,
    byMethod,
  });
});

module.exports = router;
