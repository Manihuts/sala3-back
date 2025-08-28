const Reserva = require("../models/Reserva");
const { Op } = require("sequelize");

function add30(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const total = h * 60 + m + 30;
    const hh = String(Math.floor(total / 60)).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
}

class ReservaService {
    static async createReserva({ date, startTime, userId }) {
        const conflict = await Reserva.findOne({ where: { date, startTime }});
        if (conflict) {
        throw new Error("[ERROR] :: Horário já reservado para essa data.");
        }

        return Reserva.create({ date, startTime, userId });
    }

    static async listReservas(userId, role) {
        if (role === "ADMIN") {
            return Reserva.findAll({ include: [{ association: 'User', attributes: ['id','name','login','role'] }], order:[['date','ASC'],['startTime','ASC']] });
        }
        return Reserva.findAll({ where: { userId }, order:[['date','ASC'],['startTime','ASC']] });
    }

    static async getAvailability(date){
        const items = await Reserva.findAll({ where: { date }, include: [{ association:'User', attributes:['name'] }] });
        const byStart = new Map(items.map(r => [r.startTime.slice(0,5), r]));

        const slots = [];
        const starts = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"];
        
        for(const start of starts){
        const end = add30(start);
        const r = byStart.get(start);
        if(r){
            slots.push({ start, end, status:'booked', by: r.User?.name || '—' });
        } else {
            slots.push({ start, end, status:'free' });
        }
        }
        return slots;
    }
}

module.exports = ReservaService;
