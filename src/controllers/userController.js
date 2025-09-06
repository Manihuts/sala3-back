const UserService = require("../services/userService")

module.exports = {
    async create(req, res) {
        try {
            const { name, login, password, role } = req.body;
            const user = await UserService.createUser({ name, login, password, role });
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async list(req, res) {
        try {
            const users = await UserService.listUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateSelf(req, res) {
        try {
            const { id: requesterId } = req.user;
            const { login, currentPassword, newPassword } = req.body || {};
            const out = await UserService.updateUser({
                requesterId,
                login,
                currentPassword,
                newPassword
            });
            return res.status(200).json(out);
        } catch (err) {
            return res.status(err.status || 500).json({ error: err.message });
        }
    },
}
