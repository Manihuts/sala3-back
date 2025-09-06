const ReservaService = require("../services/reservaService");
const { User } = require("../models");

module.exports = {
  async create(req, res) {
    try {
      const { date, startTime, userId: bodyUserId } = req.body;

      let targetUserId = req.user.id;
      if (req.user.role === "ADMIN" && bodyUserId) {
        const parsed = Number(bodyUserId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          const e = new Error("[ERROR] :: userId inválido.");
          e.status = 400;
          throw e;
        }

        const target = await User.findByPk(parsed, { attributes: ["id", "role", "name"], });
        if (!target) {
          const e = new Error("[ERROR] :: Usuário alvo não encontrado.");
          e.status = 400;
          throw e;
        }

        targetUserId = parsed;
      }

      const reserva = await ReservaService.createReserva({
        date,
        startTime,
        userId: targetUserId,
      });
      
      res.status(201).json(reserva);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  },

  async list(req, res) {
    try {
      const { id, role } = req.user;
      const reservas = await ReservaService.listReservas(id, role);
      res.status(200).json(reservas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async undo(req, res) {
    try {
      const reservaId = req.params.id;
      const { id: requesterId, role: requesterRole } = req.user;

      const out = await ReservaService.undoReserva({
        reservaId,
        requesterId,
        requesterRole,
      });

      return res.status(200).json(out);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  },

  async availability(req, res) {
    try {
      const { date } = req.query;
      if (!date)
        return res.status(400).json({ error: "Parâmetro 'date' é obrigatório (YYYY-MM-DD)." });

      const slots = await ReservaService.getAvailability(date);
      res.json(slots);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  },
};
