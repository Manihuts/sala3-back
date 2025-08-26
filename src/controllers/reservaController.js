const Reserva = require("../models/Reserva");
const User = require("../models/User")

const BLOCK_DURATION_MINUTES = 30;
const ALLOWED_BLOCKS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"];

module.exports = {
  async create(req, res) {
    try {
      const { date, startTime, userId } = req.body;

      if (!ALLOWED_BLOCKS.includes(startTime)) {
        return res.status(400).json({ error: "[ERRO] :: Horário inválido. Escolha um dos blocos de tempo permitidos." });
      }

      const conflict = await Reserva.findOne({
        where: { date, startTime }
      });
      if (conflict) return res.status(400).json({ error: "[ERRO] :: Esse bloco já está reservado!" });

      const reserva = await Reserva.create({ date, startTime, userId });
      res.status(201).json(reserva);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
        const reservas = await Reserva.findAll({ 
            include: { model: User, attributes: ["id", "name", "role", ] },
            order: [["date", "ASC"], ["startTime", "ASC"]] 
        });
        res.status(200).json(reservas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  }
};
