const bcrypt = require("bcrypt");
const User = require("../models/User");
const { Op } = require('sequelize');

class UserService {
    static async createUser({ name, login, password, role }) {
        const hashPassword = await bcrypt.hash(password, 12);
        return User.create({ name, login, password: hashPassword, role });
    }

    static async listUsers() {
        return User.findAll({ 
            attributes: { 
                exclude: ["password"] 
            } 
        });
    }

    static async updateUser({ requesterId, login, currentPassword, newPassword }) {
        const id = Number(requesterId);
        if (!Number.isInteger(id) || id <= 0) {
            const e = new Error('[ERROR] :: Usuário inválido.');
            e.status = 400;
            throw e;
        }

        const user = User.findByPk(id);
        if (!user) {
            const e = new Error('[ERROR] :: Usuário não encontrado.');
            e.status = 404;
            throw e;
        }

        if (typeof login !== 'undefined') {
            const newLogin = String(login).trim();
            if (newLogin.length < 5 || newLogin.length > 20) {
                const e = new Error('[ERROR] :: Login deve ter entre 5 e 20 caracteres.');
                e.status = 400;
                throw e;
            }
        
            const exists = await User.findOne({
                where: { login: newLogin, id: { [Op.ne]: id } },
                attributes: ['id']
            });
            if (exists) {
                const e = new Error('[ERROR] :: Já existe um usuário com esse login.');
                e.status = 409;
                throw e;
            }

            user.login = newLogin;
        }

        if (typeof newPassword !== 'undefined') {
            const p = String(newPassword);
            if (p.length < 6 || p.length > 30) {
                const e = new Error('[ERROR] :: Nova senha deve ter entre 6 e 30 caracteres.');
                e.status = 400;
                throw e;
            }

            const cur = String(currentPassword || '');
            const ok = await bcrypt.compare(cur, user.password || '');
            if (!ok) {
                const e = new Error('[ERROR] :: Senha atual incorreta.');
                e.status = 401;
                throw e;
            }

            user.password = await bcrypt.hash(p, 12);
        }

        await user.save();

        return { id: user.id, name: user.name, login: user.login, role: user.role };
    }
}

module.exports = UserService;