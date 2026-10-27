const express = require("express");
require("dotenv").config();
const pool = require("./config/db");

const app = express();
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const [rows] = await pool.query("SELECT 1 + 1 AS result");
  res.json({ status: "ok", db: rows[0].result });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));