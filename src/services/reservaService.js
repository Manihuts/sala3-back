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
    return halfHourStarts("08:00", "12:00");
  }
  // seg - sexta
  return [
    ...halfHourStarts("08:00", "13:00"),
    ...halfHourStarts("14:00", "20:00"),
  ];
}

class ReservaService {
    static async createReserva({ date, startTime, userId }) {
        const start = String(startTime).slice(0, 5);
        const allowed = startsForDate(date);

        if (allowed.length === 0) {
            throw new Error("[ERROR] :: Não há reservas permitidas para esta data (Domingo).");
        }

        if (!allowed.includes(start)) {
            throw new Error(`[ERROR] :: Horário ${start} não é permitido para a data ${date}.`);
        }

        const conflict = await Reserva.findOne({ where: { date, startTime }});
        if (conflict) {
        throw new Error("[ERROR] :: Horário já reservado para essa data.");
        }

        return Reserva.create({ date, startTime, userId });
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
