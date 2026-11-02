const bcrypt = require("bcrypt");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const signup = asyncHandler(async (req, res) => {
  let { username, email, password, name } = req.body;

  // 1. Validate: never trust what the user sends
  if (!username || !email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  username = username.trim().toLowerCase();
  email = email.trim().toLowerCase();
  name = name.trim();

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return res.status(400).json({
      message: "Username must be 3-30 characters: letters, numbers, underscore",
    });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (username, email, password_hash, name) VALUES (?, ?, ?, ?)",
    [username, email, passwordHash, name]
  );

  res.status(201).json({
    message: "Account created",
    user: { id: result.insertId, username, email, name },
  });
});

const login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  email = email.trim().toLowerCase();

  // 1. Find the user
  const [rows] = await pool.query(
    "SELECT id, username, email, name, password_hash FROM users WHERE email = ?",
    [email]
  );
  const user = rows[0];

  // 2. Check the password: grind the typed one and compare with the stored hash
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // 3. Make the wristband
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 4. Put it in a cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  res.json({
    message: "Logged in",
    user: { id: user.id, username: user.username, email: user.email, name: user.name },
  });
});

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out" });
};

const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, username, email, name, bio, github_username, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  if (!rows[0]) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: rows[0] });
});

module.exports = { signup ,login, logout, me};
