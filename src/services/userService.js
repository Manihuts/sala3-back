const bcrypt = require("bcrypt");
const User = require("../models/User");

class UserService {
    static async createUser({ name, login, password, role }) {
        const hashPassword = await bcrypt.hash(password, 10);
        return User.create({ name, login, password: hashPassword, role });
    }

    static async listUsers() {
        return User.findAll({ 
            attributes: { 
                exclude: ["password"] 
            } 
        });
    }
}

module.exports = UserService;