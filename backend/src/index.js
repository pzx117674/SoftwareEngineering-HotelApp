const express = require("express");
const cors = require("cors");
const path = require("path");
const { getDb } = require("./database");

const roomsRouter = require("./routes/rooms");
const reservationsRouter = require("./routes/reservations");
const paymentsRouter = require("./routes/payments");
const authRouter = require("./routes/auth");
const reportsRouter = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

getDb();

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const distPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`[Server] HRS running on http://localhost:${PORT}`);
});
