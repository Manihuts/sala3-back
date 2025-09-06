const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth")

router.get("/list", userController.list);
router.post("/create", userController.create);
router.put("/update", auth(['COLABORADOR','ADMIN']), userController.updateSelf);

module.exports = router;