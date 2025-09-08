const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const auth = require("../middleware/auth");

// Lista reservas (admin -> todas, colaborador -> apenas suas) - precisa estar logado
router.get("/list", auth(["COLABORADOR", "ADMIN"]), reservaController.list);

// Cria reserva - precisa estar logado
router.post("/create", auth(["COLABORADOR", "ADMIN"]), async (req, res, next) => {
    if (req.user.role === "COLABORADOR") {
        req.body.userId = req.user.id;
    }
    next();
}, reservaController.create);

// Desfaz reserva (admin -> qualquer uma, colaborador -> apenas suas) - precisa estar logado
router.delete("/:id", auth(["COLABORADOR", "ADMIN"]), reservaController.undo);

router.get("/availability", auth(["COLABORADOR", "ADMIN"]), reservaController.availability);

router.get("/summary", auth(["COLABORADOR", "ADMIN"]), reservaController.summary);

module.exports = router;