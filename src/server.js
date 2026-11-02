const express = require("express");
require("dotenv").config();
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userprofileroutes=require("./routes/user_profileRoutes")

const app = express();
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const { apiLimiter } = require("./middleware/rateLimiter");
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users",userprofileroutes)





const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));