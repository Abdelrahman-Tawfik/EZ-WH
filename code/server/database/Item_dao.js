const Item = require("../modules/Item");

exports.getItems = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = "SELECT * FROM Item;";
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);}
            const tds = rows.map((r) => new Item(r.ItemID, r.Description, r.Price, r.SKUID, r.SupplierID));
            resolve(tds);
        });
    });
}
exports.getItemByIDAndSupplierID = (id, supplierId) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM Item WHERE ItemID = ${id} AND SupplierID = ${supplierId};`;
        dbConnection.get(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            if (rows === undefined)
                resolve(rows);
            else
                resolve(new Item(rows.ItemID, rows.Description, rows.Price, rows.SKUID, rows.SupplierID));
        });
    });
}
exports.getItemBySKUIDAndSupplierID = (SKUID, supplierID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `select * from Item
      where SKUID=${SKUID} and
      SupplierID=${supplierID}`;
        dbConnection.get(sql, function (err, row) {
            if (err) {
                reject(err);
            } else {
                if (row === undefined) {
                    resolve(undefined);
                } else {
                    const tds = new Item(
                        row.ItemID,
                        row.Description,
                        row.Price,
                        row.SKUID,
                        row.SupplierID
                    );
                    resolve(tds);
                }
            }
        });
    });
}
exports.createItem = (item) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO Item(ItemID, Description, Price, SKUID, SupplierID) 
        VALUES (?, ?, ?, ?, ?);`;
        dbConnection.run(sql, [item.id, item.description, item.price, item.skuId, item.supplierId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(item.id);
            }
        });
    });
}

exports.modifyItem = (id,supplierId, newDescription, newPrice) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE Item SET Description = ?, Price = ?  WHERE ItemID = ? AND SupplierID=?;`;
        dbConnection.run(sql, [newDescription, newPrice, id, supplierId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

exports.deleteItem = (id,supplierId) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM Item WHERE ItemID = ? AND SupplierID=?;`;
        dbConnection.run(sql, [id,supplierId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
//USED ONLY FOR TESTING
exports.deleteAllItems = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM Item `;
        dbConnection.run(sql, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

}
