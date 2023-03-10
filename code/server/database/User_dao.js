const sqlite = require("sqlite3");
const { User } = require("../modules/User");



exports.getUserInfo = (id) => {
} //TODO

exports.getSuppliers = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = 'SELECT * FROM User WHERE Type = ?';
        dbConnection.all(sql, "supplier", (err, rows) => {
            if (err) {
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users);
        });
    });
}

exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = 'SELECT * FROM User WHERE Type <> ?'; // also, ADMIN??
        dbConnection.all(sql, "manager", (err, rows) => {
            if (err) {
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users);
        });
    });
}

exports.createUser = (email, name, surname, password, type) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO User (Name, Surname, Email, Type, Password)
      VALUES (?, ?, ?, ?, ?)`;
        dbConnection.run(sql, [name, surname, email, type, password], function (err) {
            if (err) {
                reject(err);
            }
            resolve(this.lastID);
        });
    });
}

exports.modifyUserRights = (email, oldType, newType) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE User SET Type=?
         WHERE Email=? AND Type=?`;
        dbConnection.run(sql, [newType, email, oldType], function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

exports.deleteUser = (email, type) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM User WHERE Email=? AND Type=?`;
        dbConnection.run(sql, [email, type], function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

exports.getUserByEmail = (email, type) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM User WHERE Email=? AND Type=?`;
        dbConnection.all(sql, [email, type], (err, rows) => {
            if (err) {
                reject(err);
            }
            const users = rows.map((u) => new User(u.UserID, u.Name, u.Surname, u.Email, u.Type, u.Password));
            resolve(users[0]);
        });
    });
}

exports.getUserByID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM User WHERE UserID=?`;
        dbConnection.get(sql, [ID], (err, row) => {
            if (err) {
                reject(err);
            }
            if (row===undefined){
                resolve(undefined);
            }
            else {
                const user = new User(row.UserID, row.Name, row.Surname, row.Email, row.Type, row.Password);
                resolve(user);
            }
        });
    });
    
}