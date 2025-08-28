const Reserva = require("../models/Reserva");
const { Op } = require("sequelize");

class ReservaService {
    static async createReserva({ date, startTime, userId }) {
        const conflict = await Reserva.findOne({
            where: {
                date,
                [Op.or]: [
                { startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } }
                ]
            }
        });

        if (conflict) {
        throw new Error("Horário já reservado para essa data.");
        }

        return Reserva.create({ date, startTime, endTime, userId });
    }

    static async listReservas(userId, role) {
        if (role === "ADMIN") {
        return Reserva.findAll({ include: ["User"] });
        }
        return Reserva.findAll({ where: { userId } });
    }
}

module.exports = ReservaService;
