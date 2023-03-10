const InternalOrder = require("../modules/InternalOrder");
const {db: dbConnection} = require("./DatabaseConnection");


exports.createInternalOrderProduct = (internalOrderID, SKUID,description,price, QTY) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO InternalOrderProduct (InternalOrderID, SKUID,description,price, QTY)
      VALUES (?,?,?,?,?);`;
        dbConnection.run(sql, [internalOrderID, SKUID,description,price, QTY],function (err) {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.createInternalOrder = (issueDate, customerID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO InternalOrder (IssueDate, CustomerID, State)
                     VALUES (?, ?, 'ISSUED');`;
        dbConnection.run(sql,[issueDate,customerID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}


exports.getInternalOrders = (state) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        let sql = `SELECT * FROM InternalOrder  WHERE State = ?;`;
        dbConnection.all(sql,[state], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                const tds = rows.map((r) =>
                    new InternalOrder(
                        r.InternalOrderID,
                        r.IssueDate,
                        r.State,
                        r.CustomerID
                    )
                );
                resolve(tds);
            }
        });
    });
}


exports.getInternalOrderByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM InternalOrder where InternalOrderID=?;`;
        dbConnection.all(sql,[id], function (err, rows) {
            if (err) {
                reject(err.toString());
                return;
            }
            const IO = rows.map((r) => new InternalOrder(r.InternalOrderID,
                    r.IssueDate, r.State, r.CustomerID));
            resolve(IO);
        });
    });
}

exports.getInternalOrderProductByInternalOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM InternalOrderProduct where InternalOrderID=?;`;
        dbConnection.all(sql, [ID],function (err, rows) {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows);
            }
        });
    });
}

exports.getInternalOrderSKUItemByInternalOrderID = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM InternalOrderSKUItem where InternalOrderID=?;`;
        dbConnection.all(sql,[ID], function (err, rows) {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// deleteInternalOrderSKUItemByInternalOrderID(ID){
//   return new Promise((resolve, reject) => {
//const dbConnection = require("./DatabaseConnection").db;
//     const sql = `DELETE FROM InternalOrderSKUItem where InternalOrderID=${ID};`;
//     dbConnection.run(sql, function (err){
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }

exports.createInternalOrderSKUItem = (orderId,SKUID, RFID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = ` INSERT INTO InternalOrderSKUItem (InternalOrderID, SKUID, RFID)
      VALUES (?,?,?)`;
        dbConnection.run(sql,[orderId, SKUID, RFID], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

exports.modifyInternalOrderState = (id, newState) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE InternalOrder SET State=? where InternalOrderID=?`;
        dbConnection.run(sql,[newState, id], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

exports.deleteInternalOrder = (ID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `delete from InternalOrder where InternalOrderID=${ID}`;
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}