const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const { login, password } = req.body;

  const user = await User.findOne({ where: { login } });
  if (!user) return res.status(400).json({ error: "[ERRO] :: O usuário não foi encontrado." });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "[ERRO] :: A senha informada está incorreta." });

  const token = jwt.sign(
    { id: user.id, name: user.name, login: user.login, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      login: user.login,
      role: user.role
    }
  });
});

module.exports = router;