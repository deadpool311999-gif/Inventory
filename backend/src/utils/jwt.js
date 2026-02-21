const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, storeId: user.storeId ?? null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = { signToken };
