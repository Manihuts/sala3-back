const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./User");
const Reserva = require("./Reserva");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = User;
db.Reserva = Reserva;

module.exports = db;