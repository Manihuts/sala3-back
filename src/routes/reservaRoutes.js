const express = require("express");
const router = express.Router();
const reservaController = require("../controllers/reservaController");
const auth = require("../middleware/auth");

// Listar - qualquer usuário logado
router.get("/list", auth(["COLABORADOR", "ADMIN"]), reservaController.list);

// Criar - colaborador cria pra si, admin cria para qualquer um
router.post("/create", auth(["COLABORADOR", "ADMIN"]), async (req, res, next) => {
    if (req.user.role === "COLABORADOR") {
        req.body.userId = req.user.id;
    }
    next();
}, reservaController.create);

module.exports = router;
