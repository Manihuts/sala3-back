const userService = require("../services/userService")

module.exports = {
    async create(req, res) {
        try {
            const { name, login, password, role } = req.body;
            const user = await userService.createUser({ name, login, password, role });
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const users = await userService.listUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: err.message });
        }
    }
}