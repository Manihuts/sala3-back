const ReservaService = require("../services/reservaService");

module.exports = {
  async create(req, res) {
    try {
      const { date, startTime } = req.body;
      const userId = req.user.id;
      const reserva = await ReservaService.createReserva({ date, startTime, userId });
      res.status(201).json(reserva);
    } catch (err) {
      res.status(400).json({ error: err.message });
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

      const out = await ReservaService.undoReserva({ reservaId, requesterId, requesterRole });

      return res.status(200).json(out);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  },

  async availability(req, res){
  try{
    const { date } = req.query;
    if(!date) return res.status(400).json({ error: "Parâmetro 'date' é obrigatório (YYYY-MM-DD)." });
    const slots = await ReservaService.getAvailability(date);
    res.json(slots);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}};