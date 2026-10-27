const errorHandler = (err, req, res, next) => {
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Username or email already taken" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};

module.exports = errorHandler;