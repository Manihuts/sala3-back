require("dotenv").config();
const bcrypt = require("bcrypt");

const db = require("../src/models");
const User = require("../src/models/User");

async function main() {
  const login = process.env.SEED_ADMIN_LOGIN || "admin";
  const name = process.env.SEED_ADMIN_NAME || "Cuidato Admin";
  const pass = process.env.SEED_ADMIN_PASS || "@dmin2025cuidato";

  await db.sequelize.authenticate();
  await db.sequelize.sync();

  let user = await User.findOne({ where: { login } });
  if (user) {
    console.log(
      `[seed] Usuário '${login}' já existe (id=${user.id}). Nada a fazer.`
    );
    return process.exit(0);
  }

  const password = await bcrypt.hash(pass, 10);
  user = await User.create({
    name,
    login,
    password,
    role: "ADMIN",
  });

  console.log(`[seed] ADMIN criado: id=${user.id}, login=${login}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed] erro:", err);
  process.exit(1);
});
