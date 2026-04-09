const express = require("express");
const { getDb } = require("../database");

const router = express.Router();

// GET /api/rooms — list all rooms (staff dashboard) [FR-4]
router.get("/", (_req, res) => {
  const db = getDb();
  const rooms = db.prepare("SELECT * FROM rooms ORDER BY roomNumber").all();
  res.json(rooms);
});

// GET /api/rooms/featured — returns up to 3 available rooms for landing page
router.get("/featured", (_req, res) => {
  const db = getDb();
  const rooms = db
    .prepare("SELECT * FROM rooms WHERE status = 'AVAILABLE' ORDER BY pricePerNight DESC LIMIT 3")
    .all();
  res.json(rooms);
});

// GET /api/rooms/cities — returns distinct city list
router.get("/cities", (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT city FROM rooms ORDER BY city")
    .all();
  res.json(rows.map((r) => r.city));
});

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&city=&guests= — search [FR-1]
router.get("/available", (req, res) => {
  const { checkIn, checkOut, city, guests } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: "checkIn and checkOut query parameters are required." });
  }

  if (checkIn >= checkOut) {
    return res.status(400).json({ error: "checkOut must be after checkIn." });
  }

  const db = getDb();

  // A room is available if:
  //   1. Its status is 'AVAILABLE'
  //   2. There is no overlapping CONFIRMED or PENDING reservation for the requested date range
  //   3. Optionally matches city and minimum capacity (guests)
  let sql = `SELECT * FROM rooms
     WHERE status = 'AVAILABLE'
       AND roomId NOT IN (
         SELECT roomId FROM reservations
         WHERE status IN ('CONFIRMED', 'PENDING')
           AND checkInDate < ?
           AND checkOutDate > ?
       )`;
  const params = [checkOut, checkIn];

  if (city) {
    sql += ` AND city = ?`;
    params.push(city);
  }

  if (guests) {
    const guestsNum = parseInt(guests, 10);
    if (!isNaN(guestsNum) && guestsNum > 0) {
      sql += ` AND capacity >= ?`;
      params.push(guestsNum);
    }
  }

  sql += ` ORDER BY roomNumber`;

  const rooms = db.prepare(sql).all(...params);

  res.json(rooms);
});

// GET /api/rooms/:id — room details [FR-2]
router.get("/:id", (req, res) => {
  const db = getDb();
  const room = db.prepare("SELECT * FROM rooms WHERE roomId = ?").get(req.params.id);

  if (!room) {
    return res.status(404).json({ error: "Room not found." });
  }

  res.json(room);
});

// PATCH /api/rooms/:id/status — update room status (staff) [FR-5]
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const validStatuses = ["AVAILABLE", "BOOKED", "MAINTENANCE"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
  }

  const db = getDb();
  const result = db
    .prepare("UPDATE rooms SET status = ? WHERE roomId = ?")
    .run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Room not found." });
  }

  const room = db.prepare("SELECT * FROM rooms WHERE roomId = ?").get(req.params.id);
  res.json(room);
});

module.exports = router;
