const SKUItem = require("../modules/SKUItem");

exports.getSKUItems = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM SKUItem;`;
        dbConnection.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock)));
            }
        });
    });
}

exports.getSKUItemsBySKU = (SKUID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM SKUItem WHERE SKUID = ? AND Available = 1;`;
        dbConnection.all(sql, SKUID, (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map((s) => new SKUItem(s.RFID, s.SKUID, s.Available, s.DateOfStock)));
        });
    });
}

exports.getSKUItemByRfid = (rfid) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM SKUItem WHERE RFID = ?;`;
        dbConnection.get(sql, rfid, (err, row) => {
            if (err) reject(err);
            else resolve(row ? new SKUItem(row.RFID, row.SKUID, row.Available, row.DateOfStock) : undefined);
        });
    });
}

exports.createSKUItem = (rfid, SKUId, dateOfStock) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO SKUItem(rfid, skuid, available, dateofstock) VALUES (?, ?, 0, ?)`;
        dbConnection.run(sql, [rfid, SKUId, dateOfStock], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

exports.modifySKUItem = (rfid, newRfid, newAvailable, newDateOfStock) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE SKUItem SET
		  	RFID = ?,
		  	Available = ?,
		  	DateOfStock = ?
		  	WHERE RFID = ?;`;
        dbConnection.run(sql, [newRfid, newAvailable, newDateOfStock, rfid], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

exports.deleteSKUItem = (rfid) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM SKUItem WHERE RFID = ?;`;
        dbConnection.run(sql, [rfid], (err) => {
            if (err) reject(err);
            else resolve(err);
        });
    });
}
//USED ONLY FOR TESTING
exports.deleteAllSKUItems = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM SKUItem `;
        dbConnection.run(sql, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}