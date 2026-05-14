const express = require("express");
const crypto = require("crypto");
const { getDb } = require("../database");

const router = express.Router();

// Demo customer account (not a staff member — no DB row needed)
const DEMO_CUSTOMER = {
  username: "user",
  password: "user123",
  name: "Demo Guest",
  role: "user",
  email: "user@demo.com",
};

// In-memory session tokens (sufficient for a demo prototype)
const sessions = new Map();

// Middleware: attach req.user from Bearer token or return 401
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  req.user = sessions.get(token);
  next();
}

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // 1. Try staff table (MANAGER, RECEPTIONIST, MARKETING)
  const db = getDb();
  const staffMember = db
    .prepare("SELECT * FROM staff WHERE username = ? AND password = ?")
    .get(username, password);

  if (staffMember) {
    const role = staffMember.role.toLowerCase(); // MANAGER -> manager
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, {
      username: staffMember.username,
      name: staffMember.fullName,
      role,
      email: staffMember.email,
      createdAt: Date.now(),
    });
    return res.json({
      token,
      user: { username: staffMember.username, name: staffMember.fullName, role, email: staffMember.email },
    });
  }

  // 2. Fallback: demo customer account
  if (username === DEMO_CUSTOMER.username && password === DEMO_CUSTOMER.password) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { ...DEMO_CUSTOMER, createdAt: Date.now() });
    return res.json({
      token,
      user: { username: DEMO_CUSTOMER.username, name: DEMO_CUSTOMER.name, role: DEMO_CUSTOMER.role, email: DEMO_CUSTOMER.email },
    });
  }

  return res.status(401).json({ error: "Invalid credentials." });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true });
});

// GET /api/auth/me — validate token and return user info
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const session = sessions.get(token);
  res.json({
    username: session.username,
    name: session.name,
    role: session.role,
    email: session.email,
  });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
