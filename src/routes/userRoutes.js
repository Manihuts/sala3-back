const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/list", userController.list);
router.post("/create", userController.create);

module.exports = router;