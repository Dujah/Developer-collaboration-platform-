const express = require("express");
const { signup, login, logout, me } = require("../controllers/authController");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiter");
const protect = require("../middleware/auth");
const router = express.Router();

router.post("/signup",signupLimiter ,signup);
router.post("/login",loginLimiter, login);
router.post("/logout", protect, logout);
router.get("/me", protect, me);

module.exports = router;