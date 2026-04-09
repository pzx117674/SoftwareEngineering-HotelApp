const express = require("express");
const crypto = require("crypto");

const router = express.Router();

// Demo credentials (hardcoded for prototype)
const DEMO_ACCOUNTS = [
  {
    username: "admin",
    password: "admin123",
    name: "Hotel Manager",
    role: "manager",
    email: "admin@hotel.com",
  },
  {
    username: "user",
    password: "user123",
    name: "Demo Guest",
    role: "user",
    email: "user@demo.com",
  },
];

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

  const account = DEMO_ACCOUNTS.find(
    (a) => a.username === username && a.password === password
  );

  if (!account) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    username: account.username,
    name: account.name,
    role: account.role,
    email: account.email,
    createdAt: Date.now(),
  });

  res.json({
    token,
    user: {
      username: account.username,
      name: account.name,
      role: account.role,
      email: account.email,
    },
  });
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
