const Reserva = require("../models/Reserva");

const HALF = 30;

function toMin(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function fromMin(min) {
    const hh = String(Math.floor(min / 60)).padStart(2, "0");
    const mm = String(min % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

function halfHourStarts(startHM, endHM) {
    const start = toMin(startHM);
    const end   = toMin(endHM);
    const out = [];
    for (let t = start; t <= end - HALF; t += HALF) out.push(fromMin(t));
    return out;
}

function add30(hhmm) {
    return fromMin(toMin(hhmm) + HALF);
}

function weekdayUTC(dateStr) {
    return new Date(dateStr + "T00:00:00Z").getUTCDay();
}

function startsForDate(dateStr) {
  const weekday = weekdayUTC(dateStr);
  if (weekday === 0) return []; // domingo
  if (weekday === 6) { // sábado
    return halfHourStarts("08:00", "11:30");
  }
  // seg - sexta
  return [
    ...halfHourStarts("08:00", "12:30"),
    ...halfHourStarts("14:00", "19:30"),
  ];
}

class ReservaService {
    static async createReserva({ date, startTime, userId }) {
        const start = String(startTime).slice(0, 5);
        const allowed = startsForDate(date);

        if (allowed.length === 0) {
            const e = new Error("[ERROR] :: Não há reservas permitidas para esta data (Domingo).");
            e.status = 400;
            throw e;
        }

        if (!allowed.includes(start)) {
            const e = new Error(`[ERROR] :: Horário ${start} não é permitido para a data ${date}.`);
            e.status = 400;
            throw e;
        }

        const conflict = await Reserva.findOne({ where: { date, startTime: start }});
        if (conflict) {
            const e = new Error("[ERROR] :: Horário já reservado para essa data.");
            e.status = 409;
            throw e;
        }

        return Reserva.create({ date, startTime: start, userId });
    }

    static async listReservas(userId, role) {
        if (role === "ADMIN") {
            return Reserva.findAll({ 
                include: [{ association: 'User', attributes: ['id','name','login','role'] }],
                order:[['date','ASC'],['startTime','ASC']] 
            });
        }
        return Reserva.findAll({ 
            where: { userId }, 
            order:[['date','ASC'],['startTime','ASC']] 
        });
    }

    static async undoReserva({ reservaId, requesterId, requesterRole }) {
        const idNum = Number(reservaId);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            const e = new Error("[ERROR] :: ID de reserva inválido.");
            e.status = 400;
            throw e;
        }

        const reserva = await Reserva.findByPk(idNum, { attributes: ["id", "userId"] });
        if (!reserva) {
            const e = new Error("[ERROR] :: Reserva não encontrada.");
            e.status = 404;
            throw e;
        }

        const isAdmin = requesterRole === "ADMIN";

        const reqIdNum = Number(requesterId);
        const resUserIdNum = Number(reserva.userId);

        const isOwner =
            (!Number.isNaN(reqIdNum) && !Number.isNaN(resUserIdNum) && reqIdNum === resUserIdNum) ||
            (String(requesterId) === String(reserva.userId));

        if (!isAdmin && !isOwner) {
            const e = new Error("[ERROR] :: Você não tem permissão para desfazer esta reserva.");
            e.status = 403;
            throw e;
        }

        const deleted = await Reserva.destroy({ where: { id: idNum } });
        if (!deleted) {
            const e = new Error("[ERROR] :: Essa reserva já foi removida.");
            e.status = 404;
            throw e;
        }

        return { ok: true, id: idNum };
    }

    static async getAvailability(date){
        const starts = startsForDate(date);
        if (starts.length === 0) return [];
        
        const items = await Reserva.findAll({ 
            where: { date }, 
            include: [{ association:'User', attributes:['name'] }]
        });
        
        const byStart = new Map(items.map(r => [String(r.startTime).slice(0, 5), r]));

        const slots = [];
        for(const start of starts){
            const end = add30(start);
            const r = byStart.get(start);
            if(r) {
                slots.push({ start, end, status:'booked', by: r.User?.name || '—' });
            } else {
                slots.push({ start, end, status:'free' });
            }
        }
        return slots;
    }
}

module.exports = ReservaService;
