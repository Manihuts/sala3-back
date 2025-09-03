const { Sequelize } = require("sequelize");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida.");
}

const useSSL = String(process.env.DB_SSL || '').toLowerCase() === 'true';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: (process.env.DB_SSL === 'true') ? { ssl: { require: true } } : {}
});

module.exports = sequelize;