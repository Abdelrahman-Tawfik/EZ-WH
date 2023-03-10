const RestockOrder = require("../modules/RestockOrder");

exports.getRestockOrders = (state) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrder`;
        if (state) sql += ` where State = '${state}'`;
        sql += `;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map((row) => new RestockOrder(
                    row.RestockOrderID,
                    row.IssueDate,
                    row.State,
                    row.SupplierID,
                    row.TransportNote
                )));
            }
        });
    });
}

exports.getRestockOrderByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrder WHERE RestockOrderID= ${id};`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    const tds = new RestockOrder(
                        row.RestockOrderID,
                        row.IssueDate,
                        row.State,
                        row.SupplierID,
                        row.TransportNote
                    );
                    resolve(tds);
                } else {
                    resolve(undefined);
                }
            }
        });
    });
}

exports.getRestockOrderProductsByRestockOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrderProduct where RestockOrderID=${ID}`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getRestockOrderSKUItemsByRestockOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM RestockOrderSKUItem where RestockOrderID=${ID}`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getRestockOrderReturnItems = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        // const select_sql = `select RestockOrderID from RestockOrder where RestockOrderID=${ID}`
        // dbConnection.all(select_sql, (err, rows) => {
        //     if (err) {
        //         reject(err);
        //     } else {
        //         if (rows.length === 0) {
        //             resolve(undefined);
        //         }
        const sql = `select rosi.SKUID, rosi.RFID, rosi.ItemID from RestockOrderSKUItem as rosi
          inner join TestResult as t
          where t.RFID = rosi.RFID and
          rosi.RestockOrderID=${ID} and
          t.Result = false
          group by rosi.SKUID, rosi.RFID, rosi.ItemID
          having count(*)>0;`;
        dbConnection.all(sql, function (err, rows) {
            if (err) {
                reject(err);
                return;
            }
            const tds = rows.map(
                (r) =>
                    ({"SKUId": r.SKUID, "rfid": r.RFID, "itemId": r.ItemID})
            );
            resolve(tds);
        });
        // }
        // });
    });
}

exports.createRestockOrder = (issueDate, supplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `
        INSERT INTO RestockOrder
        (IssueDate, SupplierID, State)
        values
        ('${issueDate}', ${supplierID}, 'ISSUED'); `;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}
exports.createRestockOrderProduct = (itemID, supplierId, restockOrderID, QTY) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `insert into RestockOrderProduct (ItemID, SupplierID, RestockOrderID, QTY)
      values (?, ?, ?, ?)`;
        dbConnection.run(sql, [itemID, supplierId, restockOrderID, QTY], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.modifyRestockOrderState = (id, newState) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE RestockOrder
      SET State='${newState}'
      WHERE RestockOrderID=${id}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes)
            }
        });
    });
}

exports.addSkuItemToRestockOrder = (ID, RFID, SKUID, ItemID, SupplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO RestockOrderSkuItem
      (RFID, RestockOrderID, SKUID, ItemID, SupplierID)
      values (?, ?, ?, ?, ?);`;
        dbConnection.run(sql, [RFID, ID, SKUID, ItemID, SupplierID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

exports.addTransportNoteToRestockOrder = (ID, transportNote) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `update RestockOrder set TransportNote='${transportNote}' where RestockOrderID=${ID}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
}

exports.deleteRestockOrder = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `delete from RestockOrder where RestockOrderID=${ID}`;
        dbConnection.run(sql, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
