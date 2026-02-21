const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../db/prisma");
const { signToken } = require("../utils/jwt");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/bootstrap-owner", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ message: "Email and password (min 8 chars) are required." });
    }

    const ownerCount = await prisma.user.count({ where: { role: "OWNER" } });
    if (ownerCount > 0) {
      return res.status(403).json({ message: "Owner already exists. Use owner panel for user creation." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const owner = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), passwordHash, role: "OWNER" },
      select: { id: true, email: true, role: true, storeId: true }
    });

    const token = signToken(owner);
    return res.status(201).json({ token, user: owner });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email is already in use." });
    }
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const safeUser = { id: user.id, email: user.email, role: user.role, storeId: user.storeId };
    const token = signToken(safeUser);

    return res.json({ token, user: safeUser });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
