const express = require("express");
require("dotenv").config();
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);





const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));