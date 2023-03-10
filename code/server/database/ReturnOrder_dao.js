const ReturnOrder = require("../modules/ReturnOrder");

exports.createReturnOrder = (returnDate, restockOrderID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into ReturnOrder (ReturnDate, RestockOrderId)
      values ('${returnDate}', ${restockOrderID});`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.createReturnOrderProducts = (ID, RFID, ItemID, SupplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into ReturnOrderProduct (RFID, ReturnOrderID, ItemID, SupplierID)
      values (?, ?, ?, ?);`;
        dbConnection.run(sql, [RFID, ID, ItemID, SupplierID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.getReturnOrderProducts = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrderProduct where ReturnOrderID=${ID};`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getReturnOrders = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrder;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const tds = rows.map((r) => new ReturnOrder(
                    r.ReturnOrderID,
                    r.ReturnDate,
                    r.RestockOrderID
                ));
                resolve(tds);
            }
        });
    });
}

exports.getReturnOrderByID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from ReturnOrder where ReturnOrderID=${ID};`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new ReturnOrder(
                        row.ReturnOrderID,
                        row.ReturnDate,
                        row.RestockOrderID
                    );
                    resolve(tds);
                }
            }
        });
    });
}

exports.deleteReturnOrder = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `delete from ReturnOrder where ReturnOrderID=${ID}`;
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
