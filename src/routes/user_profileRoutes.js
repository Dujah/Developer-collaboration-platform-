const express = require("express");
const {viewprofile,edictprofile,addSkill,removeSkill}=require("../controllers/profileController")
const protect = require("../middleware/auth");
const router = express.Router();
router.get("/:username",viewprofile)
router.patch("/me",protect,edictprofile)
router.post("/me/skills",protect,addSkill)
router.delete("/me/skills/:skillId",protect,removeSkill)

module.exports = router;