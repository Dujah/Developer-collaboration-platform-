const bcrypt = require("bcrypt");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

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

module.exports = { signup };
