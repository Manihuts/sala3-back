const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Reserva = sequelize.define("Reserva", {
    id: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    date: { 
        type: DataTypes.DATEONLY, 
        allowNull: false 
    },
    startTime: { 
        type: DataTypes.TIME, 
        allowNull: false 
    },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }
}, {
    tableName: "reservas",
    timestamps: true,
    indexes: [
        { unique: true, fields: ["date", "startTime"] },
        { fields: ["date"] }
    ]
});

// 1 -> N (1 usuário possui N reservas)
User.hasMany(Reserva, { foreignKey: "userId", as: "Reservas" });
Reserva.belongsTo(User, { foreignKey: "userId", as: "User" });

module.exports = Reserva; 