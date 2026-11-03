const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");


const edictprofile=async(req,res)=>{
    let {name, bio, github_username}=req.body;
    const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (name.trim().length > 50) {
      return res.status(400).json({ message: "Name must be at most 50 characters" });
    }
    updates.name = name.trim();
  }

  if (bio !== undefined) {
    if (typeof bio !== "string") {
      return res.status(400).json({ message: "Bio must be text" });
    }
    if (bio.trim().length > 300) {
      return res.status(400).json({ message: "Bio must be at most 300 characters" });
    }
    updates.bio = bio.trim() === "" ? null : bio.trim();
  }

  if (github_username !== undefined) {
    if (typeof github_username !== "string") {
      return res.status(400).json({ message: "GitHub username must be text" });
    }
    const gh = github_username.trim();
    if (gh !== "" && !/^[a-zA-Z0-9-]{1,39}$/.test(gh)) {
      return res.status(400).json({
        message: "GitHub username: max 39 characters, letters, numbers and hyphens only",
      });
    }
    updates.github_username = gh === "" ? null : gh;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  //some important stuff heare
  const values=Object.values(updates)
  const fields=Object.keys(updates)
  
const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const [result]=await pool.query(
          `UPDATE users SET ${setClause} WHERE id = ?`,
          [...values, req.user.id]
    )
    res.status(200).json({message:"updated sucessfully"})


}

const addSkill = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // 1. Validate and normalize
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "Skill name is required" });
  }
  const skillName = name.trim().toLowerCase();
  if (skillName.length > 50) {
    return res.status(400).json({ message: "Skill name must be at most 50 characters" });
  }

  // 2. Create the skill only if it doesn't already exist
  await pool.query("INSERT IGNORE INTO skills (name) VALUES (?)", [skillName]);

  // 3. Get its id (whether just created or already there)
  const [rows] = await pool.query("SELECT id FROM skills WHERE name = ?", [skillName]);
  const skillId = rows[0].id;

  // 4. Link it to the user
  const [result] = await pool.query(
    "INSERT IGNORE INTO user_skills (user_id, skill_id) VALUES (?, ?)",
    [req.user.id, skillId]
  );

  if (result.affectedRows === 0) {
    return res.status(409).json({ message: "You already have this skill" });
  }

  res.status(201).json({ message: "Skill added", skill: { id: skillId, name: skillName } });
});

const removeSkill = asyncHandler(async (req, res) => {
  const skillId = req.params.skillId;
  const userId = req.user.id;

  const [result] = await pool.query(
    "DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?",
    [userId, skillId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "You don't have this skill" });
  }

  res.status(204).send();
});

const viewProfile = asyncHandler(async (req, res) => {
  const username = req.params.username;

  // 1. Get the user (id is needed for the skills query)
  const [rows] = await pool.query(
    "SELECT id, username, name, bio, github_username, created_at FROM users WHERE username = ?",
    [username]
  );

  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // 2. Get their skills (only runs if the user exists)
  const [skillRows] = await pool.query(
    `SELECT s.name
     FROM user_skills us
     JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = ?
     ORDER BY s.name`,
    [user.id]
  );

  // 3. Build the response
  const { id, ...profile } = user;

  res.json({
    user: {
      ...profile,
      skills: skillRows.map((row) => row.name),
    },
  });
});

module.exports={edictprofile,addSkill,removeSkill,viewProfile}