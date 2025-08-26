const User = require("../models/User");
const bcrypt =require("bcrypt");

module.exports = {
    async create(req, res) {
        try {
            const { name, login, password, role } = req.body;
            const hashPassword = await bcrypt.hash(password, 10);
            const user = await User.create ({ name, login, password: hashPassword, role });
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async list(req, res) {
        const users = await User.findAll({ attributes: { exclude: ["password"] } });
        res.status(200).json(users);
    }
}