const sequelize = require("./database");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("[SUCCESS] Conexão com o banco estabelecida!");
  } catch (error) {
    console.error("[ERROR] Falha na conexão com o banco: ", error);
  }
}

testConnection();