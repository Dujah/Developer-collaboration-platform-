const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const viewprofile=asyncHandler(async(req,res)=>{
    const username=req.params.username;
    const [rows]=await pool.query(
        "select username,name,bio,github_username from users where username=?",
        [username]
    )
    const user=rows[0]
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    return res.status(200).json({user})

});

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


module.exports={viewprofile,edictprofile}