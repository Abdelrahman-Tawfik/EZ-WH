const dao = require("../database/User_dao");
const { User } = require("../modules/User");
const EzWhException = require("../modules/EzWhException.js");

class UserService {
    constructor() {
    }

    getUserInfo(id) {
    } // TODO

    async getSuppliers() {
        try {
            let suppliers = await dao.getSuppliers();
            return suppliers.map((s) => {
                return {
                    id: s.id,
                    name: s.name,
                    surname: s.surname,
                    email: s.email,
                };
            });
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

    async getUsers() {
        try {
            let users = await dao.getUsers();
            return users.map((u) => {
                return {
                    id: u.id,
                    name: u.name,
                    surname: u.surname,
                    email: u.email,
                    type: u.type,
                };
            });
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

    async createUser(email, name, surname, password, type) {
        //TODO
        try {
            let u = await dao.getUserByEmail(email, type);
            // console.log(u);
            if (u !== undefined) throw EzWhException.Conflict;
            let my_pwd = User.storePassword(password);
            await dao.createUser(email, name, surname, my_pwd, type);
        } catch (err) {
            // console.log("User Already Exists!");
            // console.log(err);
            if (err === EzWhException.Conflict) throw err;
            throw EzWhException.InternalError;
        }
    }

    async login(email, password, type) {
        // TODO
        try {
            let u = await dao.getUserByEmail(email, type);
            if (u === undefined) throw EzWhException.Unauthorized;
            else {
                if (u.verifyPassword(password)) {
                    return {
                        id: u.id,
                        username: u.email,
                        name: u.name,
                        surname: u.surname,
                    };
                } else throw EzWhException.Unauthorized;
            }
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.Unauthorized) throw err;
            throw EzWhException.InternalError;
        }
    }

    logout(id) {
    } // TODO

    async modifyUserRights(email, oldType, newType) {
        try {
            let u = await dao.getUserByEmail(email, oldType);
            if (u === undefined) throw EzWhException.NotFound;
            await dao.modifyUserRights(email, oldType, newType);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async deleteUser(email, type) {
        try {
            await dao.deleteUser(email, type);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

    async getUserByEmail(email, type) {
        try {
            let u = await dao.getUserByEmail(email, type);
            if (u === undefined) throw EzWhException.NotFound;
            return {
                id: u.id,
                name: u.name,
                surname: u.surname,
            };
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

}

module.exports = UserService;
