const express = require("express");
const cors = require("cors");
const { getDb } = require("./database");

const roomsRouter = require("./routes/rooms");
const reservationsRouter = require("./routes/reservations");
const paymentsRouter = require("./routes/payments");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database (creates tables + seeds on first run)
getDb();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/payments", paymentsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`[Server] HRS backend running on http://localhost:${PORT}`);
});
