const express = require("express");
const {viewprofile,edictprofile}=require("../controllers/profileController")
const protect = require("../middleware/auth");
const router = express.Router();
router.get("/:username",viewprofile)
router.patch("/me",protect,edictprofile)

module.exports = router;